// File: apps/frontend/lib/idleLogout.ts
/**
 * Sets up an idle timer that logs the user out after a specified period of inactivity
 *
 * @param timeout The timeout in milliseconds before logging out
 * @returns A cleanup function to remove the event listeners
 */
export function startIdleTimer(timeout: number) {
    let timer: NodeJS.Timeout
  
    // Reset the timer whenever user activity is detected
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        // Redirect to logout page
        window.location.href = "/auth/logout"
      }, timeout)
    }
  
    // Events to listen for
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
  
    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, false)
    })
  
    // Start the timer immediately
    resetTimer()
  
    // Return a cleanup function
    return () => {
      clearTimeout(timer)
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }
  
  