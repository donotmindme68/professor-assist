import React, { useRef, useEffect, VideoHTMLAttributes } from "react";

interface VideoPlayerProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "autoPlay"> {
  isPlaying: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isPlaying, ...rest }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return <video ref={videoRef} {...rest} />;
};

export default VideoPlayer;
