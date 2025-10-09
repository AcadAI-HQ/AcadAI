"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PulsatingButton } from '@/components/ui/pulsating-button';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { useUserCount } from '@/hooks/use-user-count';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MorphingText } from "../ui/morphing-text";

function ShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    uniforms: {
      time: { type: string; value: number };
      resolution: { type: string; value: THREE.Vector2 };
    };
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    // Fragment shader - white and grey gradient with bottom fade
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.05;
        float lineWidth = 0.002;

        float intensity = 0.0;
        for(int i=0; i < 5; i++){
          intensity += lineWidth * float(i*i) / abs(fract(t + float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
        }

        // White and grey gradient
        float grad = smoothstep(-1.0, 1.0, uv.y);
        vec3 white = vec3(1.0);
        vec3 grey = vec3(0.85, 0.85, 0.85);
        vec3 color = mix(white, grey, grad) * intensity * 1.2;

        // Fade to black at bottom
        float fadeStart = -0.5;
        float fadeEnd = -1.5;
        float fade = smoothstep(fadeEnd, fadeStart, uv.y);
        color *= fade;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Initialize Three.js scene
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    // Handle window resize
    const onWindowResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };

    // Initial resize
    onWindowResize();
    window.addEventListener("resize", onWindowResize, false);

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };

    // Store scene references for cleanup
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }

        sceneRef.current.renderer.dispose();
        geometry.dispose();
        material.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{
        background: "#000",
        overflow: "hidden",
        maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
      }}
    />
  );
}

export default function HeroWithShader() {
  const { userCount, loading } = useUserCount();

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center text-center">
      {/* Shader Background */}
      <ShaderBackground />

      {/* Gradient fade overlay to blend with next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent z-[5]" />

      {/* Content */}
      <motion.div
        className="relative z-10 container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight font-headline">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              AI That
            </span>
            <span className="my-3 sm:my-4 p-2"><MorphingText texts={["Shapes", "Saves"]}/></span>
            <span>Your Tech Career</span>
          </h1>

          <p className="mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl xl:text-2xl leading-7 sm:leading-8 text-white/80 max-w-2xl lg:max-w-3xl mx-auto px-2">
            No more guessing what the companies want, know exactly what they are hiring for today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
            <PulsatingButton className="w-full sm:w-auto shadow-2xl shadow-white/25">
              <Link href="/signup">
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </Link>
            </PulsatingButton>
            <ShimmerButton className="font-semibold bg-transparent w-full sm:w-auto">
              <Link href="#about">
                Learn More
              </Link>
            </ShimmerButton>
          </div>

          <div className="flex flex-col items-center gap-3">
            {/* Text with user count */}
            <p className="text-white/80 text-sm sm:text-base">
              Join{" "}
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <span className="font-semibold text-white">{userCount.toLocaleString()}+</span>
              )}{" "}
              other students and devs on the platform.
            </p>

            {/* Avatar Stack with count in last circle */}
            <div className="flex -space-x-3 flex-wrap justify-center gap-y-2 sm:flex-nowrap sm:gap-y-0">
              <Avatar className="h-8 w-8 border-2 border-black">
                <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="User 1" />
                <AvatarFallback>U1</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black">
                <AvatarImage src="https://i.pravatar.cc/150?img=2" alt="User 2" />
                <AvatarFallback>U2</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black">
                <AvatarImage src="https://i.pravatar.cc/150?img=3" alt="User 3" />
                <AvatarFallback>U3</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black">
                <AvatarImage src="https://i.pravatar.cc/150?img=4" alt="User 4" />
                <AvatarFallback>U4</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black">
                <AvatarImage src="https://i.pravatar.cc/150?img=5" alt="User 5" />
                <AvatarFallback>U5</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black hidden sm:block">
                <AvatarImage src="https://i.pravatar.cc/150?img=6" alt="User 6" />
                <AvatarFallback>U6</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black hidden sm:block">
                <AvatarImage src="https://i.pravatar.cc/150?img=7" alt="User 7" />
                <AvatarFallback>U7</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black hidden md:block">
                <AvatarImage src="https://i.pravatar.cc/150?img=8" alt="User 8" />
                <AvatarFallback>U8</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black hidden md:block">
                <AvatarImage src="https://i.pravatar.cc/150?img=9" alt="User 9" />
                <AvatarFallback>U9</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-black hidden lg:block">
                <AvatarImage src="https://i.pravatar.cc/150?img=10" alt="User 10" />
                <AvatarFallback>U10</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-auto max-w-[200px] sm:max-w-none border-2 border-black bg-black p-2">
                <AvatarFallback className="text-white text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  {loading ? "..." : `${userCount.toLocaleString()}+`} <span className="hidden sm:inline"> users using Acad AI</span>
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}