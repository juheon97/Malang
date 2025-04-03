import React, { useRef, useEffect } from 'react';

export default function OpenViduVideoComponent({ streamManager, isSelf }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      console.log('Setting up video element for stream:', streamManager);
      
      // First clean up any existing video elements
      try {
        streamManager.removeAllVideos();
      } catch (err) {
        console.log('No videos to remove');
      }
      
      // Add the video element with a small delay to ensure DOM is ready
      setTimeout(() => {
        if (videoRef.current) {
          try {
            streamManager.addVideoElement(videoRef.current);
            console.log('Video element successfully added');
          } catch (error) {
            console.error('Error adding video element:', error);
          }
        }
      }, 100);
    }

    return () => {
      if (streamManager) {
        try {
          console.log('Cleaning up video element');
          streamManager.removeAllVideos();
        } catch (err) {
          console.log('Error during cleanup:', err);
        }
      }
    };
  }, [streamManager]);

  return (
    <div className="video-container h-full w-full">
      <video
        autoPlay={true}
        playsInline={true}
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={isSelf}
      />
    </div>
  );
}