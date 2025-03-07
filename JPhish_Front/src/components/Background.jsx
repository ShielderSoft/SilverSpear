import React, { useCallback } from 'react'
import '../background.css'
import Particles from 'react-tsparticles'
import { loadSlim } from 'tsparticles-slim';

const Background = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine); // Loads a compatible, lighter version
  }, []);

  return (
    <div className="fixed inset-0 -z-20">
      <Particles
        init={particlesInit}
        options={{
          background: { color: '#ffffff' },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'repulse' },
              onClick: { enable: true, mode: 'push' },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
              push: {
                quantity: 4,
              },
            },
          },
          particles: {
            color: { value: '#333232' },
            links: {
              color: '#676464',
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: { enable: false }, // Disable collisions to prevent momentum buildup
            move: {
              enable: true,
              outModes: { default: 'out' }, // Use 'out' instead of 'bounce' to prevent acceleration
              random: false,
              straight: false,
              speed: 1.5, // Slightly reduced speed
              direction: "none",
              decay: 0.0001, // Add decay to prevent acceleration over time
              trail: {
                enable: false,
              },
            },
            number: {
              density: { enable: true, area: 800 },
              value: 80, // Reduced number of particles
              limit: 90, // Add a limit to prevent excess particles
            },
            shape: { type: 'circle' },
            size: { 
              random: true, 
              value: 3,
              animation: {
                enable: false // Disable size animation
              }
            },
            opacity: {
              value: 0.6, // Set a fixed opacity
              random: false,
              animation: {
                enable: false // Disable opacity animation
              }
            },
          },
          detectRetina: true,
          pauseOnBlur: true, // Pause animation when window is not focused
          smooth: true, // Enable smoother animations
        }}
      />
    </div>
  )
}

export default Background