"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="py-24">

      <div className="mx-auto max-w-7xl px-8">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >

          <span className="rounded-full bg-blue-100 px-4 py-2 text-blue-700">
            AI Powered Event Platform
          </span>

          <h1 className="mt-8 text-6xl font-bold leading-tight">

            Transform Trade Events

            <br />

            Into

            <span className="text-blue-600">
              {" "}365-Day Business Ecosystems
            </span>

          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl text-gray-600">

            Connect Organizers, Exhibitors, Buyers,
            Visitors and Suppliers with AI Matchmaking,
            Smart Lead Generation and Virtual Booths.

          </p>

          <div className="mt-10 flex justify-center gap-5">

            <Button size="lg">
              Get Started Free
            </Button>

            <Button variant="outline" size="lg">
              Book Demo
            </Button>

          </div>

        </motion.div>

      </div>

    </section>
  );
}