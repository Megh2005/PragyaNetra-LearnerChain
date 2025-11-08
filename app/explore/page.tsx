"use client";
import { TweetCard } from "@/components/ui/tweet-card";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ExplorePage = () => {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-y-auto">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className="mx-auto w-full max-w-6xl px-4 pb-16">
        {/* About Us Section */}
        <div className="mb-16 pt-8">
          <h1 className="mb-12 text-center tracking-widest text-4xl font-bold text-white">
            About <span className="text-sky-400">PragyaNetra</span>
          </h1>
          <div className="space-y-8">
            {/* Mission - Left aligned */}
            <div className="flex justify-start">
              <div className="w-full md:w-2/3 lg:w-1/2">
                <div className="rounded-lg border-2 border-cyan-500 bg-black/40 p-6 backdrop-blur-sm">
                  <h3 className="mb-3 text-2xl font-semibold text-purple-300">
                    Our Mission
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    We are building a decentralized future where community
                    governance meets innovative technology. Our mission is to
                    empower individuals through transparent, democratic
                    decision-making processes that give every member a voice in
                    shaping our collective destiny.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision - Right aligned */}
            <div className="flex justify-end">
              <div className="w-full md:w-2/3 lg:w-1/2">
                <div className="rounded-lg border-2 border-cyan-500 bg-black/40 p-6 backdrop-blur-sm">
                  <h3 className="mb-3 text-2xl font-semibold text-purple-300">
                    Our Vision
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    We envision a world where organizations operate without
                    centralized control, where trust is built through code and
                    consensus, and where value flows directly to contributors.
                    By leveraging blockchain technology and smart contracts,
                    we're creating a new paradigm for collaboration and
                    collective ownership.
                  </p>
                </div>
              </div>
            </div>

            {/* Governance - Left aligned */}
            <div className="flex justify-start">
              <div className="w-full md:w-2/3 lg:w-1/2">
                <div className="rounded-lg border-2 border-cyan-500 bg-black/40 p-6 backdrop-blur-sm">
                  <h3 className="mb-3 text-2xl font-semibold text-purple-300">
                    Governance Model
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Our DAO operates on a fully transparent governance framework
                    where token holders have proportional voting rights on all
                    major decisions. Proposals are submitted by community
                    members, discussed openly, and voted on-chain to ensure
                    immutable record-keeping and accountability.
                  </p>
                </div>
              </div>
            </div>

            {/* Decentralized Structure - Right aligned */}
            <div className="flex justify-end">
              <div className="w-full md:w-2/3 lg:w-1/2">
                <div className="rounded-lg border-2 border-cyan-500 bg-black/40 p-6 backdrop-blur-sm">
                  <h3 className="mb-3 text-2xl font-semibold text-purple-300">
                    Decentralized Structure
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    There is no single authority or central leadership. Instead,
                    our community is organized into working groups that focus on
                    specific initiatives. Smart contracts automate treasury
                    management, reward distribution, and decision execution,
                    ensuring that governance remains fair, efficient, and
                    resistant to manipulation.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <InteractiveHoverButton className="border-2 border-cyan-500">
              <Link href="/auth">Get Started</Link>
            </InteractiveHoverButton>
          </div>
        </div>

        <h1 className="mb-12 text-center tracking-widest text-4xl font-bold text-white">
          What <span className="text-sky-400">Community</span> Says
        </h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TweetCard
            className="border-white border-2"
            id="1668408059125702661"
          />
          <TweetCard
            className="border-white border-2"
            id="1986118820948529419"
          />
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
