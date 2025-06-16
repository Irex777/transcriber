import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Select from 'react-select';

// Define language options for the dropdown
const languageOptions = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
  { value: 'ru', label: 'Russian' },
  { value: 'ko', label: 'Korean' },
  { value: 'fr', label: 'French' },
  { value: 'ja', label: 'Japanese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'tr', label: 'Turkish' },
  { value: 'pl', label: 'Polish' },
  { value: 'ca', label: 'Catalan' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ar', label: 'Arabic' },
  { value: 'sv', label: 'Swedish' },
  { value: 'it', label: 'Italian' },
  { value: 'id', label: 'Indonesian' },
  { value: 'hi', label: 'Hindi' },
  { value: 'fi', label: 'Finnish' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'he', label: 'Hebrew' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'el', label: 'Greek' },
  { value: 'ms', label: 'Malay' },
  { value: 'cs', label: 'Czech' },
  { value: 'ro', label: 'Romanian' },
  { value: 'da', label: 'Danish' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'ta', label: 'Tamil' },
  { value: 'no', label: 'Norwegian' },
  { value: 'th', label: 'Thai' },
  { value: 'ur', label: 'Urdu' },
  { value: 'hr', label: 'Croatian' },
  { value: 'bg', label: 'Bulgarian' },
  { value: 'lt', label: 'Lithuanian' },
  { value: 'la', label: 'Latin' },
  { value: 'mi', label: 'Maori' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'cy', label: 'Welsh' },
  { value: 'sk', label: 'Slovak' },
  { value: 'te', label: 'Telugu' },
  { value: 'fa', label: 'Persian' },
  { value: 'lv', label: 'Latvian' },
  { value: 'bn', label: 'Bengali' },
  { value: 'sr', label: 'Serbian' },
  { value: 'az', label: 'Azerbaijani' },
  { value: 'sl', label: 'Slovenian' },
  { value: 'kn', label: 'Kannada' },
  { value: 'et', label: 'Estonian' },
  { value: 'mk', label: 'Macedonian' },
  { value: 'br', label: 'Breton' },
  { value: 'eu', label: 'Basque' },
  { value: 'is', label: 'Icelandic' },
  { value: 'hy', label: 'Armenian' },
  { value: 'ne', label: 'Nepali' },
  { value: 'mn', label: 'Mongolian' },
  { value: 'bs', label: 'Bosnian' },
  { value: 'kk', label: 'Kazakh' },
  { value: 'sq', label: 'Albanian' },
  { value: 'sw', label: 'Swahili' },
  { value: 'gl', label: 'Galician' },
  { value: 'mr', label: 'Marathi' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'si', label: 'Sinhala' },
  { value: 'km', label: 'Khmer' },
  { value: 'sn', label: 'Shona' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'so', label: 'Somali' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'oc', label: 'Occitan' },
  { value: 'ka', label: 'Georgian' },
  { value: 'be', label: 'Belarusian' },
  { value: 'tg', label: 'Tajik' },
  { value: 'sd', label: 'Sindhi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'am', label: 'Amharic' },
  { value: 'yi', label: 'Yiddish' },
  { value: 'lo', label: 'Lao' },
  { value: 'uz', label: 'Uzbek' },
  { value: 'fo', label: 'Faroese' },
  { value: 'ht', label: 'Haitian Creole' },
  { value: 'ps', label: 'Pashto' },
  { value: 'tk', label: 'Turkmen' },
  { value: 'nn', label: 'Nynorsk' },
  { value: 'mt', label: 'Maltese' },
  { value: 'sa', label: 'Sanskrit' },
  { value: 'lb', label: 'Luxembourgish' },
  { value: 'my', label: 'Myanmar (Burmese)' },
  { value: 'bo', label: 'Tibetan' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'mg', label: 'Malagasy' },
  { value: 'as', label: 'Assamese' },
  { value: 'tt', label: 'Tatar' },
  { value: 'haw', label: 'Hawaiian' },
  { value: 'ln', label: 'Lingala' },
  { value: 'ha', label: 'Hausa' },
  { value: 'ba', label: 'Bashkir' },
  { value: 'jw', label: 'Javanese' },
  { value: 'su', label: 'Sundanese' },
];

// Define quality options
const qualityOptions = [
  { value: 'tiny', label: 'Tiny (Fastest)' },
  { value: 'base', label: 'Base' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large-v3', label: 'Large (Best)' }, // Assuming v3 is the default large
];

interface Job {
  id: string;
  filename: string;
  status: 'Queued' | 'Processing' | 'Completed' | 'Error';
  progress: number;
  transcript?: TranscriptSegment[];
  error?: string;
  filePath?: string;
  outputPath?: string;
  audioUrl?: string; // Added for audio playback
  existingTranscript?: boolean; // Flag for existing transcript file
}

interface TranscriptSegment {
  start: number;
  end: number;
  speaker: string;
  text: string;
  isManuallyAdded?: boolean;
}

declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>; // Add invoke signature
      writeToClipboard: (text: string) => Promise<void>;
      readFromClipboard: () => Promise<string>;
      resolveFileUrl: (filePath: string) => Promise<string>;
      fileExists: (filePath: string) => Promise<boolean>;
      transcodeToMp3: (params: { inputPath: string; outputPath: string }) => Promise<{ success: boolean; outputPath?: string; error?: string }>;
      deleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      trimAudio: (params: { inputPath: string; outputPath: string; start: number; end: number }) => Promise<{ success: boolean; outputPath?: string; error?: string }>;
    };
  }
}

// Component state interface for trim controls
interface TrimControls {
  start: number;
  end: number;
  isOpen: boolean;
  saveMode: 'new' | 'overwrite';
}

const App: React.FC = () => {
  // Component state
  const [showTimestamps, setShowTimestamps] = useState(true); // Toggle for timestamps in exports
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<{ value: string; label: string; }>(languageOptions[0]); // Initialize with the 'Auto Detect' option object
const [selectedQuality, setSelectedQuality] = useState<{ value: string; label: string; }>(qualityOptions[4]); // Default to Large
const [speakerSensitivity, setSpeakerSensitivity] = useState<number>(0.5); // Default to middle sensitivity
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [currentPlayingSegment, setCurrentPlayingSegment] = useState<{ jobId: string; segmentIndex: number } | null>(null); // Tracks segment-specific playback/highlighting
  const [currentTime, setCurrentTime] = useState<number>(0); // Current playback time for the timeline
  const [trimControls, setTrimControls] = useState<TrimControls>({ start: 0, end: 0, isOpen: false, saveMode: 'new' });
  const [duration, setDuration] = useState<number>(0); // Total duration of the selected audio file
  const [isFullPlaybackActive, setIsFullPlaybackActive] = useState<boolean>(false); // Tracks if main playback is running
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Tracks the player's playing state (for main button)
  const timeUpdateListenerRef = useRef<(() => void) | null>(null);
  const [selectedJobsForExport, setSelectedJobsForExport] = useState<Set<string>>(new Set()); // State for multi-export selection
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for the file input
  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  // Handle timeline slider change
  const handleTimelineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };


  // Ensures the audio player is ready (loaded, transcoded if needed) for a given job
  const ensureAudioPlayerReady = async (jobToPlay: Job): Promise<HTMLAudioElement | null> => {
    if (!jobToPlay?.filePath) {
      console.error('[ensureAudioPlayerReady ERROR] No file path found.');
      return null;
    }

    console.log(`[ensureAudioPlayerReady] Ensuring player for: ${jobToPlay.filePath}`);

    // Check if player exists and source is correct
    if (audioPlayerRef.current && audioPlayerRef.current.src === jobToPlay.audioUrl) {
      console.log('[ensureAudioPlayerReady] Player exists and source matches.');
      return audioPlayerRef.current;
    }

    // Stop any existing playback and clear listeners before loading new source/creating player
    if (audioPlayerRef.current) {
      console.log('[ensureAudioPlayerReady] Pausing existing player and removing listeners.');
      audioPlayerRef.current.pause();
      if (timeUpdateListenerRef.current) {
        audioPlayerRef.current.removeEventListener('timeupdate', timeUpdateListenerRef.current);
        timeUpdateListenerRef.current = null;
      }
      // Remove pause/ended listeners associated with the old player instance
      // Note: This assumes onPauseOrEnded was defined in the scope where the old player was used.
      // We might need a more robust way to track/remove these if the context changes significantly.
      // For now, let's assume the cleanup in playSegment/handleMainStop handles this.
      audioPlayerRef.current = null; // Clear the ref before creating a new one
    }


    let audioUrlToLoad = jobToPlay.audioUrl;
    let filePathToLoad = jobToPlay.filePath;

    // 1. Handle Transcoding and URL Resolution if necessary
    if (!audioUrlToLoad || jobToPlay.filePath.toLowerCase().endsWith('.m4a')) { // Force re-resolve/transcode for M4A or if no URL cached
        console.log('[ensureAudioPlayerReady] Need to resolve URL or transcode.');
        // Handle .m4a files - transcode if needed
        if (filePathToLoad.toLowerCase().endsWith('.m4a')) {
          const mp3Path = filePathToLoad.replace(/\.m4a$/i, '.mp3');
          const mp3Exists = await window.electronAPI.fileExists(mp3Path);
          if (!mp3Exists) {
            console.log(`[ensureAudioPlayerReady] Transcoding .m4a to .mp3: ${mp3Path}`);
            try {
              const result = await window.electronAPI.transcodeToMp3({ inputPath: filePathToLoad, outputPath: mp3Path });
              if (!result.success) throw new Error(result.error || 'Transcoding failed');
              filePathToLoad = mp3Path; // Use the new MP3 path
            } catch (transcodeError) {
              console.error('[ensureAudioPlayerReady ERROR] Transcoding failed:', transcodeError);
              // Update job state with error?
              setJobs(prev => prev.map(j => j.id === jobToPlay.id ? { ...j, status: 'Error', error: `Transcoding failed: ${transcodeError}` } : j));
              return null;
            }
          } else {
            console.log(`[ensureAudioPlayerReady] Using existing MP3: ${mp3Path}`);
            filePathToLoad = mp3Path;
          }
        }

        // Resolve and cache the audio URL
        try {
          const newUrl = await window.electronAPI.resolveFileUrl(filePathToLoad);
          console.log(`[ensureAudioPlayerReady] Resolved new URL: ${newUrl}`);
          audioUrlToLoad = newUrl;
          // Update job state with new URL and potentially updated path
          setJobs(prev => prev.map(job =>
            job.id === jobToPlay.id ? { ...job, audioUrl: newUrl, filePath: filePathToLoad } : job
          ));
          // Update the local copy too for immediate use
          jobToPlay.audioUrl = newUrl;
          jobToPlay.filePath = filePathToLoad;

        } catch (resolveError) {
          console.error('[ensureAudioPlayerReady ERROR] Failed to resolve URL:', resolveError);
           setJobs(prev => prev.map(j => j.id === jobToPlay.id ? { ...j, status: 'Error', error: `Failed to resolve audio URL: ${resolveError}` } : j));
          return null;
        }
    }

    // 2. Create or Update Audio Player
    console.log(`[ensureAudioPlayerReady] Creating/updating player for URL: ${audioUrlToLoad}`);
    try {
        const newPlayer = await new Promise<HTMLAudioElement>((resolve, reject) => {
            console.log('[ensureAudioPlayerReady] Instantiating new Audio element.');
            const playerInstance = new Audio();

            const onError = (e: Event | string) => {
                const errorEvent = e as ErrorEvent;
                const mediaError = (errorEvent.target as HTMLAudioElement)?.error;
                console.error('[ensureAudioPlayerReady EVENT] Audio error event:', errorEvent);
                console.error('Audio error details:', { code: mediaError?.code, message: mediaError?.message });
                cleanupListeners(playerInstance);
                reject(new Error(`Audio load failed: ${mediaError?.message || 'Unknown audio error'}`));
            };

            const onCanPlay = () => {
                console.log('[ensureAudioPlayerReady EVENT] canplay fired.');
                if (playerInstance.duration && playerInstance.duration !== Infinity) {
                    setDuration(playerInstance.duration); // Set total duration
                } else {
                    // Fallback or wait for durationchange
                    playerInstance.addEventListener('durationchange', () => {
                         if (playerInstance.duration && playerInstance.duration !== Infinity) {
                             setDuration(playerInstance.duration);
                         }
                    }, { once: true });
                }
                console.log('[ensureAudioPlayerReady] Audio details:', { duration: playerInstance.duration, readyState: playerInstance.readyState });
                cleanupListeners(playerInstance);
                resolve(playerInstance);
            };

            const cleanupListeners = (targetPlayer: HTMLAudioElement) => {
                targetPlayer.removeEventListener('canplay', onCanPlay);
                targetPlayer.removeEventListener('error', onError);
            };

            playerInstance.addEventListener('error', onError);
            playerInstance.addEventListener('canplay', onCanPlay);
            playerInstance.src = audioUrlToLoad!;
            playerInstance.load();
        });

        audioPlayerRef.current = newPlayer; // Assign the newly created player to the ref
        console.log('[ensureAudioPlayerReady] New audio player assigned to ref.');
        return newPlayer;

    } catch (creationError) {
        console.error('[ensureAudioPlayerReady ERROR] Failed to create or load audio player:', creationError);
        // Update job state with error?
        setJobs(prev => prev.map(j => j.id === jobToPlay.id ? { ...j, status: 'Error', error: `Audio player failed to load: ${creationError}` } : j));
        return null;
    }
  };


  // Function to play audio segment
  const playSegment = async (jobId: string, segmentIndex: number, start: number, end: number) => {
    console.log(`[playSegment START] Job: ${jobId}, Segment: ${segmentIndex}, Time: ${start}-${end}`);
    const jobToPlay = jobs.find(j => j.id === jobId);
    if (!jobToPlay) {
        console.error('[playSegment ERROR] Job not found.');
        return;
    }

    // Stop full playback if it's running
    if (isFullPlaybackActive) {
        console.log('[playSegment] Stopping full playback to play segment.');
        handleMainStop(); // Use the stop handler to clean up full playback state
    }

    try {
        const player = await ensureAudioPlayerReady(jobToPlay);
        if (!player) {
            console.error("[playSegment ERROR] Player not ready.");
            setCurrentPlayingSegment(null);
            setIsPlaying(false);
            return;
        }

        // Set segment-specific state
        setCurrentPlayingSegment({ jobId, segmentIndex });
        setIsPlaying(true); // Mark as playing
        setIsFullPlaybackActive(false); // Ensure full playback is marked as inactive

        console.log(`[playSegment] Setting currentTime to ${start}. Current player time: ${player.currentTime}`);
        player.currentTime = start;
        setCurrentTime(start); // Update UI immediately

        console.log('[playSegment] Calling play()...');
        await player.play();
        console.log('[playSegment] Segment playback started.');

        // --- Listener Setup ---
        // Remove potentially old listeners first
        if (timeUpdateListenerRef.current) {
            player.removeEventListener('timeupdate', timeUpdateListenerRef.current);
        }
        player.removeEventListener('pause', handlePause);
        player.removeEventListener('ended', handleEnded);

        // Define new listeners specific to segment playback
        const segmentTimeUpdateHandler = () => {
            if (player.currentTime >= end) {
                console.log(`[playSegment EVENT] timeupdate: Reached segment end (${end}). Pausing at ${player.currentTime}.`);
                player.pause(); // This will trigger handlePause
            } else {
                setCurrentTime(player.currentTime);
                // Update duration if needed (though ensureAudioPlayerReady should handle it)
                 if (!duration && player.duration && player.duration !== Infinity) {
                    setDuration(player.duration);
                 }
            }
        };
        timeUpdateListenerRef.current = segmentTimeUpdateHandler; // Store ref

        // Add new listeners
        player.addEventListener('timeupdate', segmentTimeUpdateHandler);
        player.addEventListener('pause', handlePause); // Use shared pause handler
        player.addEventListener('ended', handleEnded); // Use shared ended handler

    } catch (error) {
        console.error('[playSegment ERROR] General error:', error);
        setCurrentPlayingSegment(null);
        setIsPlaying(false);
    }
  };

  // Cleanup audio player on component unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        console.log('[Cleanup] Pausing and cleaning up audio player on unmount.');
        audioPlayerRef.current.pause();
        if (timeUpdateListenerRef.current) {
            audioPlayerRef.current.removeEventListener('timeupdate', timeUpdateListenerRef.current);
        }
        // Remove other listeners if necessary
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Debug useEffect for transcript data
  // Debug useEffect for transcript data
  useEffect(() => {
    if (selectedJob?.transcript) {
      console.log('[Debug] Selected job transcript updated:', selectedJob.transcript.length, 'segments');
    }
  }, [selectedJob?.transcript]);

  // Save completed jobs to localStorage whenever they change


  // Save completed jobs to localStorage
  useEffect(() => {
    const completedJobs = jobs.filter(job => 
      job.status === 'Completed' && job.transcript
    );
    
    if (completedJobs.length > 0) {
      try {
        localStorage.setItem('savedJobs', JSON.stringify(completedJobs));
        console.log('[Storage] Saved completed jobs to localStorage:', completedJobs.length);
      } catch (error) {
        console.error('[Storage] Failed to save jobs to localStorage:', error);
      }
    }
  }, [jobs]);

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('savedJobs');
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);
        console.log('[Storage] Loading saved jobs from localStorage:', parsedJobs.length);
        
        // Only restore completed jobs with transcripts
        const validJobs = parsedJobs.filter((job: Job) => 
          job.status === 'Completed' && job.transcript
        );
        
setJobs(prev => {
          // Combine saved jobs with any current non-completed jobs, avoiding duplicates
          const currentActiveJobs = prev.filter(job => job.status !== 'Completed');
          const existingJobIds = new Set(currentActiveJobs.map(job => job.id));
          const uniqueValidJobs = validJobs.filter((job: Job) => !existingJobIds.has(job.id));
          return [...currentActiveJobs, ...uniqueValidJobs];
        });
        
      }
    } catch (error) {
      console.error('[Storage] Failed to load jobs from localStorage:', error);
    }
  }, []); // Run once on mount


  // Event handlers for IPC communication
  const handleJobProgress = useCallback((_event: any, { jobId, progress }: { jobId: string; progress: number }) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: 'Processing', progress } : job
      )
    );
  }, []);

  const handleJobComplete = useCallback((_event: any, { jobId, outputPath, transcript }: { jobId: string; outputPath: string; transcript: TranscriptSegment[] }) => {
    console.log(`[IPC] Received job-complete for ${jobId}:`, transcript ? `${transcript.length} segments` : 'null transcript');
    
    if (!transcript || !Array.isArray(transcript)) {
      console.error(`[IPC] Invalid transcript data received for ${jobId}:`, transcript);
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'Error', error: 'Invalid transcript data received' }
          : job
      ));
      return;
    }

    setJobs(prev => prev.map(job =>
      job.id === jobId
        ? { ...job, status: 'Completed', progress: 100, transcript: transcript.map(seg => ({...seg})), audioUrl: undefined }
        : job
    ));
    setSelectedJobId(jobId);
  }, []);

  const handleJobError = useCallback((_event: any, { jobId, error }: { jobId: string; error: string }) => {
    console.error(`[IPC] Received job-error for ${jobId}:`, error);
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: 'Error', error } : job
    ));
  }, []);

  // Set up IPC listeners
  useEffect(() => {
    console.log('[IPC] Setting up IPC listeners.');
    
    window.electronAPI.on('job-progress', handleJobProgress);
    window.electronAPI.on('job-complete', handleJobComplete);
    window.electronAPI.on('job-error', handleJobError);

    return () => {
      console.log("[IPC] Cleaning up IPC listeners.");
    };
  }, [handleJobProgress, handleJobComplete, handleJobError]);


  const handleAddFiles = async (files: FileList | null) => {
    if (!files) return;

    const newJobs = await Promise.all(Array.from(files).map(async (file) => {
      const id = `${file.name}-${Date.now()}`;
      const filePath = (file as any).path || file.name;
      const outputPath = `${filePath}.json`;
      console.log(`[Files] Adding job ${id}: ${filePath}`);

      // Check for existing transcript files
      const transcriptExtensions = ['.txt', '.srt', '.json'];
      let hasExistingTranscript = false;

      try {
        const checkResults = await Promise.all(
          transcriptExtensions.map(async (ext) => {
            const transcriptPath = filePath.replace(/\.[^/.]+$/, ext);
            return window.electronAPI.fileExists(transcriptPath);
          })
        );
        hasExistingTranscript = checkResults.some(exists => exists);
      } catch (error) {
        console.warn('Failed to check for existing transcripts:', error);
      }
      
      const langCode = selectedLanguage?.value === 'auto' ? undefined : selectedLanguage?.value;
      const qualityCode = selectedQuality?.value || 'large-v3';
      window.electronAPI.send('start-job', { 
        jobId: id, 
        filePath, 
        outputPath, 
        language: langCode, 
        quality: qualityCode,
        speakerSensitivity
      });
      
      return {
        id,
        filename: file.name,
        status: 'Queued' as const,
        progress: 0,
        filePath,
        outputPath,
        language: langCode,
        existingTranscript: hasExistingTranscript
      };
    }));

    setJobs((prev) => [...prev, ...newJobs]);
  };

// Function to insert a new segment between existing ones
const handleInsertSegment = (jobId: string, beforeIndex: number) => {
  setJobs(prev => prev.map(job => {
    if (job.id === jobId && job.transcript) {
      const transcript = [...job.transcript];
      const beforeSegment = transcript[beforeIndex - 1];
      const afterSegment = transcript[beforeIndex];
      
      // Calculate new segment timestamps
      const start = beforeSegment ? beforeSegment.end : 0;
      const end = afterSegment ? afterSegment.start : (beforeSegment ? beforeSegment.end + 1 : 1);
      const midPoint = (start + end) / 2;
      
      // Create new segment
      const newSegment: TranscriptSegment = {
        start: start,
        end: midPoint < end ? midPoint : end,
        speaker: "Speaker",
        text: "",
        isManuallyAdded: true
      };
      
      // Insert the new segment
      transcript.splice(beforeIndex, 0, newSegment);
      return { ...job, transcript };
    }
    return job;
  }));
};

// Function to delete a manually added segment
const handleDeleteSegment = (jobId: string, segmentIndex: number) => {
  setJobs(prev => prev.map(job => {
    if (job.id === jobId && job.transcript) {
      const transcript = job.transcript.filter((_, idx) => idx !== segmentIndex);
      return { ...job, transcript };
    }
    return job;
  }));
};

const handleTranscriptEdit = (jobId: string, segmentIndex: number, field: 'speaker' | 'text', newValue: string) => {
    console.log(`[Edit] Updating ${field} for segment ${segmentIndex} in job ${jobId} to: "${newValue}"`);
    setJobs(prev => prev.map(job => {
      if (job.id === jobId && job.transcript) {
        const updatedTranscript = job.transcript.map((seg, idx) => {
          if (idx === segmentIndex) {
            return { ...seg, [field]: newValue };
          }
          return seg;
        });
        return { ...job, transcript: updatedTranscript };
      }
      return job;
    }));
  };

  // Handler to reset the application state
  const handleResetAll = () => {
    console.log('[Reset] Resetting application state.');
    
    // Stop any playback
    handleMainStop();
    
    // Clear all jobs from the list (files remain on disk)
    setJobs([]);
    
    // Reset all UI states
    setSelectedJobId(null);
    setCurrentTime(0);
    setDuration(0);
    setCurrentPlayingSegment(null);
    setSelectedJobsForExport(new Set());
    setShowAIPrompt(false);
    
    // Reset file input to allow reselecting the same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      console.log('[Reset] File input cleared.');
    }
    
    // Clear localStorage to prevent jobs from being restored
    localStorage.removeItem('savedJobs');
    console.log('[Reset] Cleared saved jobs from localStorage.');
    
    alert('All jobs have been cleared from the list.\nThe original files remain unchanged on your system.');
  };

  // Handler for the main Play/Pause button
  const handleMainPlayPause = async () => {
    console.log('[Main Play/Pause] Clicked. isPlaying:', isPlaying);
    if (!selectedJob) return;

    // --- Pause Logic ---
    if (isPlaying) {
      console.log('[Main Play/Pause] Pausing full playback.');
      audioPlayerRef.current?.pause(); // Triggers handlePause
      // Note: isPlaying state is set to false within handlePause
      return; // Exit after pausing
    }

    // --- Play Logic (Start or Resume) ---
    console.log('[Main Play/Pause] Starting/Resuming full playback.');
    setIsFullPlaybackActive(true); // Mark that main playback is intended
    setCurrentPlayingSegment(null); // Ensure segment-specific highlighting is cleared initially

    try {
      const player = await ensureAudioPlayerReady(selectedJob);
      if (!player) {
        console.error("[Main Play/Pause ERROR] Player not ready.");
        setIsPlaying(false);
        setIsFullPlaybackActive(false);
        return;
      }

      // If resuming, player.currentTime should already be correct.
      // If starting fresh after stop, currentTime state should be 0.
      // If starting after segment playback, currentTime state might be somewhere else, reset it.
      if (!player.paused) { // If player wasn't paused (e.g., ended or stopped), start from beginning
         console.log('[Main Play/Pause] Player was not paused, starting from beginning.');
         player.currentTime = 0;
         setCurrentTime(0);
      } else {
         // If paused, resume from the current time state
         console.log(`[Main Play/Pause] Resuming from ${currentTime}`);
         // Ensure player's time matches state, though it should if pause worked correctly
         player.currentTime = currentTime;
      }


      await player.play();
      setIsPlaying(true); // Set playing state *after* successful play()
      console.log('[Main Play/Pause] Full playback started/resumed.');

      // --- Listener Setup for Full Playback ---
      // Remove potentially old listeners first
      if (timeUpdateListenerRef.current) {
          player.removeEventListener('timeupdate', timeUpdateListenerRef.current);
      }
      player.removeEventListener('pause', handlePause);
      player.removeEventListener('ended', handleEnded);

      // Define new timeupdate listener for full playback (highlights segments)
      const fullPlaybackTimeUpdateHandler = () => {
          const currentPlayTime = player.currentTime;
          setCurrentTime(currentPlayTime); // Update timeline UI

          // Find the segment that contains the current time for highlighting
          const currentSegmentIndex = selectedJob?.transcript?.findIndex(
              (seg) => currentPlayTime >= seg.start && currentPlayTime < seg.end
          );

          if (currentSegmentIndex !== undefined && currentSegmentIndex !== -1) {
              // Avoid unnecessary state updates if the segment hasn't changed
              if (currentPlayingSegment?.segmentIndex !== currentSegmentIndex) {
                  // console.log(`[Full Playback Timeupdate] Highlighting segment ${currentSegmentIndex}`);
                  setCurrentPlayingSegment({ jobId: selectedJob.id, segmentIndex: currentSegmentIndex });
              }
          } else {
              // If between segments or after the last one, clear highlighting
              if (currentPlayingSegment !== null) {
                  // console.log('[Full Playback Timeupdate] Clearing segment highlighting.');
                  setCurrentPlayingSegment(null);
              }
          }

          // Update duration if needed
          if (!duration && player.duration && player.duration !== Infinity) {
              setDuration(player.duration);
          }
      };
      timeUpdateListenerRef.current = fullPlaybackTimeUpdateHandler;

      // Add new listeners
      player.addEventListener('timeupdate', fullPlaybackTimeUpdateHandler);
      player.addEventListener('pause', handlePause);
      player.addEventListener('ended', handleEnded);

    } catch (error) {
        console.error('[Main Play/Pause ERROR] Error during play setup:', error);
        setIsPlaying(false);
        setIsFullPlaybackActive(false);
    }
  };

  // Handler for the main Stop button
  const handleMainStop = () => {
    console.log('[Main Stop] Clicked.');
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0; // Reset time
    }
    setIsPlaying(false);
    setIsFullPlaybackActive(false);
    setCurrentPlayingSegment(null);
    setCurrentTime(0);
  };

  // Shared handler when the audio player pauses
  const handlePause = () => {
    console.log('[Player Event] Pause fired.');
    setIsPlaying(false); // Update main play/pause button state

    // If it was playing a specific segment, clear that segment state
    // Otherwise (full playback paused), keep isFullPlaybackActive true
    if (currentPlayingSegment) {
        console.log('[Player Event Pause] Clearing currentPlayingSegment.');
        setCurrentPlayingSegment(null);
    }

    // Clean up timeupdate listener when paused
    if (audioPlayerRef.current && timeUpdateListenerRef.current) {
        console.log('[Player Event Pause] Removing timeupdate listener.');
        audioPlayerRef.current.removeEventListener('timeupdate', timeUpdateListenerRef.current);
        timeUpdateListenerRef.current = null;
    }
  };

  // Shared handler when the audio player ends
  const handleEnded = () => {
    console.log('[Player Event] Ended fired.');
    setIsPlaying(false);
    setIsFullPlaybackActive(false); // Full playback is definitely over
    setCurrentPlayingSegment(null); // Clear any highlighted segment
    setCurrentTime(duration); // Set time to the end for the timeline display

    // Clean up timeupdate listener on end
    if (audioPlayerRef.current && timeUpdateListenerRef.current) {
        console.log('[Player Event Ended] Removing timeupdate listener.');
        audioPlayerRef.current.removeEventListener('timeupdate', timeUpdateListenerRef.current);
        timeUpdateListenerRef.current = null;
    }
    // Optionally reset player time to 0 for the next full play?
    // if (audioPlayerRef.current) {
    //   audioPlayerRef.current.currentTime = 0;
    //   setCurrentTime(0);
    // }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>File Queue</h2>
        {/* Language selector */}
        <div className="language-selector">
          <label htmlFor="language-select">Select Language:</label>
          <Select
            id="language-select"
            options={languageOptions}
            value={selectedLanguage}
            onChange={(selectedOption) => setSelectedLanguage(selectedOption || languageOptions[0])} // Update state with the selected object, handle null
            className="react-select-container"
            classNamePrefix="react-select"
            isSearchable
          />
        </div>
        {/* Quality selector */}
        <div className="quality-selector">
           <label htmlFor="quality-select">Select Quality:</label>
           <Select
             id="quality-select"
             options={qualityOptions}
             value={selectedQuality}
             onChange={(selectedOption) => setSelectedQuality(selectedOption || qualityOptions[4])} // Update state, handle null
             className="react-select-container"
             classNamePrefix="react-select"
             isSearchable
           />
        </div>
        {/* Speaker Sensitivity slider */}
        <div className="sensitivity-selector">
          <label htmlFor="sensitivity-slider">Speaker Separation Sensitivity:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="range"
              id="sensitivity-slider"
              min="0"
              max="1"
              step="0.1"
              value={speakerSensitivity}
              onChange={(e) => setSpeakerSensitivity(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span>{speakerSensitivity.toFixed(1)}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Lower values combine more segments, higher values separate more frequently
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleAddFiles(e.target.files)}
          className="file-input"
        />
        <button onClick={handleResetAll} className="reset-button" disabled={jobs.length === 0}>
           Reset All
        </button>
        <ul>
          {jobs.map((job) => (
            <li
              key={job.id}
              className={`${job.id === selectedJobId ? 'selected' : ''} ${job.status === 'Completed' ? 'selectable-for-export' : ''}`}
            >
              <div className="job-item-content" onClick={() => { // Wrap content for main click area
                 if (job.id !== selectedJobId) { // Only select if not already selected
                    console.log(`[UI] Selecting job: ${job.id}`);
                    setSelectedJobId(job.id);
                    if (audioPlayerRef.current) {
                       console.log('[UI] Pausing audio due to job change.');
                       audioPlayerRef.current.pause();
                    }
                 }
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {job.existingTranscript && (
                    <span title="Existing transcript file found" style={{ 
                      color: '#2196F3',
                      cursor: 'help'
                    }}>
                      📝
                    </span>
                  )}
                  <span>{job.filename}</span>
                </div>
                <div>Status: {job.status}</div>
                {/* Add delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent job selection
                    
                    if (window.confirm(`Are you sure you want to remove "${job.filename}" from the list?\nThe original file will not be deleted.`)) {
                      // Remove job from the list
                      setJobs(prev => prev.filter(j => j.id !== job.id));
                      
                      // Clear selection if this was the selected job
                      if (job.id === selectedJobId) {
                        setSelectedJobId(null);
                        setCurrentTime(0);
                        setDuration(0);
                        setCurrentPlayingSegment(null);
                        setShowAIPrompt(false);
                      }

                      // Remove from export selection if needed
                      if (selectedJobsForExport.has(job.id)) {
                        const newSet = new Set(selectedJobsForExport);
                        newSet.delete(job.id);
                        setSelectedJobsForExport(newSet);
                      }
                    }
                  }}
                  className="delete-button"
                  title="Remove from list"
                >
                  🗑️
                </button>
              </div>
              {job.status === 'Completed' && ( // Checkbox only for completed jobs
                 <input
                   type="checkbox"
                   className="export-checkbox"
                   checked={selectedJobsForExport.has(job.id)}
                   onChange={(e) => {
                     const newSet = new Set(selectedJobsForExport);
                     if (e.target.checked) {
                       newSet.add(job.id);
                     } else {
                       newSet.delete(job.id);
                     }
                     setSelectedJobsForExport(newSet);
                   }}
                   onClick={(e) => e.stopPropagation()} // Prevent li onClick from firing
                 />
               )}
              {job.status === 'Processing' && (
                <div>Progress: {job.progress}%</div>
              )}
              {job.status === 'Error' && (
                <div className="error">Error: {job.error || 'Unknown error'}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
        {/* AI Tools */}
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={async () => {
              if (selectedJob?.transcript) {
                try {
                  const prompt = `This is a transcription from an audio file. Please correct the grammar and sentence structure while preserving the exact meaning. Keep all speaker labels and timestamps intact. Format the response exactly like the input:\n\n${selectedJob.transcript.map(seg => 
                    `[${seg.start.toFixed(2)} - ${seg.end.toFixed(2)}] ${seg.speaker}: ${seg.text}`
                  ).join('\n')}`;
                  await window.electronAPI.writeToClipboard(prompt);
                  alert('AI prompt copied to clipboard! Paste it into your preferred AI tool.');
                } catch (error) {
                  console.error('Failed to copy to clipboard:', error);
                  alert('Failed to copy to clipboard. Please try again.');
                }
              }
            }}
            disabled={!selectedJob?.transcript || selectedJob?.status !== 'Completed'}
            style={{ padding: '8px 16px' }}
          >
            📋 Copy for AI
          </button>
          <button
            onClick={() => setShowAIPrompt(prev => !prev)}
            disabled={!selectedJob?.transcript || selectedJob?.status !== 'Completed'}
            style={{ padding: '8px 16px' }}
          >
            ⚙️ Import AI Response
          </button>
        </div>
        
        {/* AI Import Dialog */}
        {showAIPrompt && selectedJob?.transcript && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ marginTop: 0 }}>Paste AI Response</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Paste the AI-corrected transcript here. Make sure it follows the same format:
              <br/>
              [timestamp] Speaker: Text
            </p>
            <textarea
              style={{ 
                width: '100%', 
                minHeight: '150px',
                marginBottom: '10px',
                padding: '8px',
                fontSize: '14px'
              }}
              placeholder="Paste AI response here..."
              onBlur={async (e) => {
                let text = e.target.value;
                if (!text) {
                  try {
                    text = await window.electronAPI.readFromClipboard();
                    e.target.value = text;
                  } catch (error) {
                    console.error('Failed to read from clipboard:', error);
                  }
                }
                try {
                  // Parse the pasted text
                  const segments = text.split('\n')
                    .map(line => {
                      const match = line.match(/\[([\d.]+) - ([\d.]+)\] ([^:]+): (.+)/);
                      if (!match) return null;
                      return {
                        start: parseFloat(match[1]),
                        end: parseFloat(match[2]),
                        speaker: match[3],
                        text: match[4]
                      };
                    })
                    .filter(seg => seg !== null);

                  if (segments.length === 0) {
                    alert('Invalid format. Please ensure each line follows: [start - end] Speaker: Text');
                    return;
                  }

                  // Update the transcript
                  setJobs(prev => prev.map(job => {
                    if (job.id === selectedJob.id) {
                      return {
                        ...job,
                        transcript: segments as TranscriptSegment[]
                      };
                    }
                    return job;
                  }));

                  setShowAIPrompt(false);
                  alert('Transcript updated successfully!');
                } catch (error) {
                  console.error('Failed to parse AI response:', error);
                  alert('Failed to parse the response. Please check the format.');
                }
              }}
            />
            <button 
              onClick={() => setShowAIPrompt(false)}
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Main Playback Controls */}
        {selectedJob?.filePath && (
          <div className="main-audio-controls" style={{ marginBottom: '10px' }}>
            <button onClick={handleMainPlayPause} disabled={!selectedJob?.filePath}>
              {isPlaying ? '❚❚ Pause' : '▶ Play Full Audio'}
            </button>
            <button onClick={handleMainStop} disabled={!isPlaying && !isFullPlaybackActive} style={{ marginLeft: '10px' }}>
              ■ Stop
            </button>
            <button 
              onClick={() => setTrimControls(prev => ({ ...prev, isOpen: true, start: 0, end: duration, saveMode: 'new' }))}
              disabled={!selectedJob?.filePath || !duration}
              style={{ marginLeft: '10px' }}
              title="Trim audio file"
            >
              ✂️ Trim
            </button>
            </div>
        )}


        {/* Trim Controls */}
        {selectedJob?.filePath && trimControls.isOpen && duration > 0 && (
            <div className="trim-controls" style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '5px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <label>Start Time: </label>
                <input 
                  type="number" 
                  min={0} 
                  max={duration} 
                  step={0.1}
                  value={trimControls.start}
                  onChange={(e) => setTrimControls(prev => ({ 
                    ...prev, 
                    start: Math.min(parseFloat(e.target.value), prev.end)
                  }))}
                  style={{ width: '80px', marginRight: '20px' }}
                />
                <label>End Time: </label>
                <input 
                  type="number"
                  min={trimControls.start}
                  max={duration}
                  step={0.1}
                  value={trimControls.end}
                  onChange={(e) => setTrimControls(prev => ({ 
                    ...prev, 
                    end: Math.max(parseFloat(e.target.value), prev.start)
                  }))}
                  style={{ width: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ marginRight: '15px' }}>
                    <input
                      type="radio"
                      name="saveMode"
                      value="new"
                      checked={trimControls.saveMode === 'new'}
                      onChange={() => setTrimControls(prev => ({ ...prev, saveMode: 'new' }))}
                      style={{ marginRight: '5px' }}
                    />
                    Save as new file
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="saveMode"
                      value="overwrite"
                      checked={trimControls.saveMode === 'overwrite'}
                      onChange={() => setTrimControls(prev => ({ ...prev, saveMode: 'overwrite' }))}
                      style={{ marginRight: '5px' }}
                    />
                    Overwrite original
                  </label>
                </div>
                <button
                  onClick={async () => {
                    if (!selectedJob?.filePath) return;
                    
                    // Determine output path based on save mode
                    const outputPath = trimControls.saveMode === 'new'
                      ? (() => {
                           const ext = selectedJob.filePath.split('.').pop();
                           const timestamp = new Date().getTime();
                           return selectedJob.filePath.replace(
                             `.${ext}`,
                             `_trim_${timestamp}.${ext}`
                           );
                         })()
                      : selectedJob.filePath;

                    try {
                      const result = await window.electronAPI.trimAudio({
                        inputPath: selectedJob.filePath,
                        outputPath,
                        start: trimControls.start,
                        end: trimControls.end
                      });

                      if (!result.success) {
                        throw new Error(result.error || 'Failed to trim audio');
                      }

                      if (trimControls.saveMode === 'new') {
                        // Add the trimmed file as a new job
                        const ext = selectedJob.filePath.split('.').pop();
                        const newJobId = `${outputPath}-${Date.now()}`;
                        setJobs(prev => [...prev, {
                          id: newJobId,
                          filename: `${selectedJob.filename.split('.')[0]}_trimmed.${ext}`,
                          status: 'Queued',
                          progress: 0,
                          filePath: outputPath
                        }]);
                      } else {
                        // Update the existing job to trigger reprocessing
                        setJobs(prev => prev.map(job => 
                          job.id === selectedJob.id
                            ? { ...job, status: 'Queued', progress: 0, transcript: undefined }
                            : job
                        ));
                      }

                      // Close trim controls
                      setTrimControls(prev => ({ ...prev, isOpen: false }));
                    } catch (error) {
                      console.error('Trim error:', error);
                      alert('Failed to trim audio: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    }
                  }}
                >
                  Save Trimmed Audio
                </button>
                <button
                  onClick={() => setTrimControls(prev => ({ ...prev, isOpen: false }))}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}


        {/* Audio Timeline */}
        {(currentPlayingSegment || isFullPlaybackActive) && (
          <div className="audio-controls" style={{ // Show timeline if segment OR full playback is active
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '5px',
            width: '100%'
          }}>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleTimelineChange}
              style={{
                width: '100%',
                marginBottom: '5px',
                cursor: 'pointer',
                // Add background highlight for current segment during full playback
                background: isFullPlaybackActive && selectedJob?.transcript && currentPlayingSegment && selectedJob.transcript[currentPlayingSegment.segmentIndex]
                    ? `linear-gradient(to right, #cce5ff ${ (selectedJob.transcript[currentPlayingSegment.segmentIndex].start / duration) * 100}%, transparent ${ (selectedJob.transcript[currentPlayingSegment.segmentIndex].end / duration) * 100}%)`
                    : 'none',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {!selectedJob && <div>Select a job to view transcript.</div>}
        {selectedJob && !selectedJob.transcript && (
          <div>
            {selectedJob.status === 'Completed' ? <div>No transcript data found. Check logs.</div> :
             selectedJob.status === 'Processing' ? <div>Processing... {selectedJob.progress}%</div> :
             selectedJob.status === 'Queued' ? <div>Queued.</div> :
             selectedJob.status === 'Error' ? <div className="error">Error: {selectedJob.error || 'Unknown'}</div> :
             <div>Unknown status.</div>}
          </div>
        )}
        {selectedJob && selectedJob.transcript && (
              <div className="transcript">
              {selectedJob?.transcript?.map((seg, idx) => {
                // A segment is "playing" if either:
                // 1. It's explicitly selected for segment playback
                // 2. It's the current segment during full playback
                const isSegmentPlaying = (currentPlayingSegment?.jobId === selectedJob?.id &&
                                 currentPlayingSegment?.segmentIndex === idx);

                // Button handler: if during full playback, seek to segment start
                const handleSegmentClick = () => {
                    // Stop full playback if it's active
                    if (isFullPlaybackActive) {
                        console.log('[UI] Stopping full playback to play segment.');
                        handleMainStop(); // Stop full playback and reset state
                        // isFullPlaybackActive is now false
                    }

                    // If full playback was active, seek to segment start
                    if (isFullPlaybackActive) {
                        console.log(`[UI] Seeking to segment ${idx} at ${seg.start}`);
                        if (audioPlayerRef.current) {
                            audioPlayerRef.current.currentTime = seg.start;
                            setCurrentTime(seg.start);
                        }
                    }
                     else {
                        // Regular segment play/pause behavior
                        if (isSegmentPlaying) {
                            console.log('[UI] Pause segment clicked.');
                            audioPlayerRef.current?.pause();
                        } else if (selectedJob?.id) {
                            console.log('[UI] Play segment clicked.');
                            playSegment(selectedJob.id, idx, seg.start, seg.end);
                        }
                    }
                };

                return (
                  <React.Fragment key={`${selectedJob.id}-${idx}-${seg.start}-${seg.end}`}>
                    <div className={`segment ${isSegmentPlaying ? 'playing' : ''}`}>
                      <button
                        className="play-button"
                        onClick={handleSegmentClick}
                        title={isFullPlaybackActive ? "Seek to segment" : (isSegmentPlaying ? "Pause segment" : "Play segment")}
                        disabled={!selectedJob?.filePath}
                      >
                        {isFullPlaybackActive ? '↩' : (isSegmentPlaying ? '❚❚' : '▶')}
                      </button>
                      <span className="timestamp">
                        [{seg.start.toFixed(2)} - {seg.end.toFixed(2)}]
                      </span>
                      <span
                        className="speaker"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => selectedJob?.id && handleTranscriptEdit(selectedJob.id, idx, 'speaker', e.currentTarget.textContent || '')}
                        style={{backgroundColor: isPlaying ? '#cce5ff' : undefined}}
                      >
                        {seg.speaker}
                      </span>
                      <span
                        className="text"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => selectedJob?.id && handleTranscriptEdit(selectedJob.id, idx, 'text', e.currentTarget.textContent || '')}
                        style={{
                          backgroundColor: isPlaying ? '#cce5ff' : undefined,
                          border: seg.isManuallyAdded ? '1px dashed #666' : 'none'
                        }}
                      >
                        {seg.text}
                      </span>
                      {seg.isManuallyAdded && (
                        <button
                          className="delete-segment-button"
                          onClick={() => selectedJob?.id && handleDeleteSegment(selectedJob.id, idx)}
                          title="Delete this segment"
                          style={{
                            marginLeft: '5px',
                            padding: '2px 6px',
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    {/* Insert button after each segment */}
                    <div 
                      style={{
                        textAlign: 'center',
                        padding: '4px',
                        opacity: 0.5,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                    >
                      <button
                        onClick={() => selectedJob?.id && handleInsertSegment(selectedJob.id, idx + 1)}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title={idx === (selectedJob?.transcript?.length || 0) - 1 ? "Add new segment at the end" : "Insert new segment here"}
                      >
                        {idx === (selectedJob?.transcript?.length || 0) - 1 ? '+ Add' : '+ Insert'}
                      </button>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
        )}
        {!selectedJob?.transcript && (
          <div>
            {selectedJob?.status === 'Completed' ? <div>No transcript data found. Check logs.</div> :
             selectedJob?.status === 'Processing' ? <div>Processing... {selectedJob?.progress}%</div> :
             selectedJob?.status === 'Queued' ? <div>Queued.</div> :
             selectedJob?.status === 'Error' ? <div className="error">Error: {selectedJob?.error || 'Unknown'}</div> :
             <div>Unknown status.</div>}
          </div>
        )}
        {/* Export controls */}
       <div className="export-controls">
          {/* Export options */}
          <div className="export-options" style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={(e) => setShowTimestamps(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Include Timestamps
            </label>
          </div>
          <button onClick={() => exportTxt(selectedJob, showTimestamps)} disabled={!selectedJob?.transcript || selectedJob?.status !== 'Completed'} title="Export only the currently selected job as TXT">Export Current (.txt)</button>
          <button onClick={() => exportSrt(selectedJob)} disabled={!selectedJob?.transcript || selectedJob?.status !== 'Completed'} title="Export only the currently selected job as SRT">Export Current (.srt)</button>
          <button onClick={() => exportCsv(selectedJob)} disabled={!selectedJob?.transcript || selectedJob?.status !== 'Completed'} title="Export only the currently selected job as CSV">Export Current (.csv)</button>
          <button onClick={() => exportJson(selectedJob)} disabled={!selectedJob?.transcript || selectedJob?.status !== 'Completed'} title="Export only the currently selected job as JSON">Export Current (.json)</button>
          <button onClick={() => copyTranscript(selectedJob, showTimestamps)} disabled={!selectedJob?.transcript || selectedJob?.status !== 'Completed'} title="Copy the transcript of the currently selected job">Copy Current</button>
          {/* Multi-File Export */}
          <button
            onClick={() => exportMultipleTxt(jobs.filter(j => selectedJobsForExport.has(j.id)), showTimestamps)}
            disabled={selectedJobsForExport.size === 0}
            style={{ marginLeft: '20px' }} // Add some spacing
            title={`Export transcripts from ${selectedJobsForExport.size} selected job(s) into a single TXT file`}
          >
            Export Selected ({selectedJobsForExport.size}) (.txt)
          </button>
       </div>
     </div>
   </div>
  );
};

// Export utility functions
const exportMultipleTxt = (selectedJobs: Job[], includeTimestamps = true) => {
  if (!selectedJobs || selectedJobs.length === 0) return;

  let combinedContent = '';
  selectedJobs.forEach(job => {
    // Ensure the job is completed and has a transcript
    if (job.status === 'Completed' && job.transcript) {
      combinedContent += `--- Transcript for: ${job.filename} ---\n\n`;
      combinedContent += job.transcript.map(seg => 
        includeTimestamps 
          ? `[${seg.start.toFixed(2)} - ${seg.end.toFixed(2)}] ${seg.speaker}: ${seg.text}`
          : `${seg.speaker}: ${seg.text}`
      ).join('\n');
      combinedContent += '\n\n'; // Add separation between files
    }
  });

  if (combinedContent) {
    downloadFile(combinedContent.trim(), 'combined_transcripts.txt', 'text/plain');
  } else {
    console.warn("[Export Multiple] No completed jobs with transcripts were selected.");
    // Optionally show an alert to the user
    // alert("No completed jobs with transcripts were selected for export.");
  }
}


const exportTxt = (job: Job | undefined, includeTimestamps = true) => {
  if (!job?.transcript) return;
  const lines = job.transcript.map(
    (seg) =>
      includeTimestamps
        ? `[${seg.start.toFixed(2)} - ${seg.end.toFixed(2)}] ${seg.speaker}: ${seg.text}`
        : `${seg.speaker}: ${seg.text}`
  );
  downloadFile(lines.join('\n'), `${job.filename}.txt`, 'text/plain');
}

const exportSrt = (job: Job | undefined) => {
  if (!job?.transcript) return;
  const lines = job.transcript.map((seg, idx) => {
    const start = secondsToSrtTime(seg.start);
    const end = secondsToSrtTime(seg.end);
    return `${idx + 1}\n${start} --> ${end}\n${seg.speaker}: ${seg.text}\n`;
  });
  downloadFile(lines.join('\n'), `${job.filename}.srt`, 'text/plain');
}

const exportCsv = (job: Job | undefined) => {
  if (!job?.transcript) return;
  const header = 'Start,End,Speaker,Text\n';
  const rows = job.transcript.map(
    (seg) =>
      `${seg.start.toFixed(2)},${seg.end.toFixed(2)},"${seg.speaker}","${seg.text.replace(/"/g, '""')}"`
  );
  downloadFile(header + rows.join('\n'), `${job.filename}.csv`, 'text/csv');
}

const exportJson = (job: Job | undefined) => {
  if (!job?.transcript) return;
  downloadFile(JSON.stringify(job.transcript, null, 2), `${job.filename}.json`, 'application/json');
}

const copyTranscript = async (job: Job | undefined, includeTimestamps = true) => {
  if (!job?.transcript) return;
  try {
    const text = job.transcript
      .map(
        (seg) =>
          includeTimestamps
            ? `[${seg.start.toFixed(2)} - ${seg.end.toFixed(2)}] ${seg.speaker}: ${seg.text}`
            : `${seg.speaker}: ${seg.text}`
      )
      .join('\n');
    await window.electronAPI.writeToClipboard(text);
    console.log('Transcript copied to clipboard');
  } catch (error) {
    console.error('Failed to copy transcript:', error);
    alert('Failed to copy transcript. Please try again.');
  }
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // Append anchor to body for Firefox compatibility
  a.click();
  document.body.removeChild(a); // Clean up anchor
  URL.revokeObjectURL(url);
}

// Time formatting utilities
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const secondsToSrtTime = (seconds: number): string => {
  const date = new Date(0);
  date.setSeconds(seconds);
  const timeStr = date.toISOString().substr(11, 8); // HH:MM:SS
  const milliseconds = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
  return `${timeStr},${milliseconds}`;
}

export default App;
