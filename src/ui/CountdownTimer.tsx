import { useEffect, useState, useCallback } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onWarningThreshold?: () => void; // Added callback for when warning threshold is reached
  warningThreshold?: number; // Seconds remaining when timer turns warning color
  dangerThreshold?: number; // Seconds remaining when timer turns danger color
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function CountdownTimer({
  initialSeconds,
  onComplete,
  onWarningThreshold,
  warningThreshold = 60, // Default 1 minute warning
  dangerThreshold = 30, // Default 30 seconds danger
  size = "md",
  className = "",
  showIcon = true,
}: CountdownTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isPaused, _setIsPaused] = useState(false);
  const [warningTriggered, setWarningTriggered] = useState(false);

  // Format seconds as mm:ss
  const formatTime = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Handle timer completion
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Timer effect
  useEffect(() => {
    // Skip if timer is paused or already at zero
    if (isPaused || secondsRemaining <= 0) {
      if (secondsRemaining <= 0) {
        handleComplete();
      }
      return;
    }

    // Check for warning threshold
    if (
      onWarningThreshold &&
      !warningTriggered &&
      secondsRemaining <= warningThreshold
    ) {
      onWarningThreshold();
      setWarningTriggered(true);
    }

    // Set up interval
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const newTime = prev - 1;

        // Handle completion
        if (newTime <= 0) {
          clearInterval(interval);
          return 0;
        }

        return newTime;
      });
    }, 1000);

    // Clean up interval on unmount or when secondsRemaining changes
    return () => clearInterval(interval);
  }, [
    secondsRemaining,
    isPaused,
    handleComplete,
    warningThreshold,
    onWarningThreshold,
    warningTriggered,
  ]);

  // Determine timer color based on remaining time
  const getTimerColor = () => {
    if (secondsRemaining <= dangerThreshold) return "text-red-500";
    if (secondsRemaining <= warningThreshold) return "text-amber-500";
    return "text-green-500";
  };

  // Determine timer size class
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-xl font-bold";
      default:
        return "text-base";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <Clock
          className={`${getTimerColor()} ${
            size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
          }`}
        />
      )}
      <span className={`${getTimerColor()} ${getSizeClass()} font-mono`}>
        {formatTime(secondsRemaining)}
      </span>
    </div>
  );
}

export default CountdownTimer;
