import { Link } from "react-router";
import { DiscordLogo } from "~/components/icons/Discord";
import { GithubLogo } from "~/components/icons/Github";

export default function Home() {
  return (
    <>
      <div className="mt-4 w-full flex items-center justify-center text-gray-500">
        Work In Progress.
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <Link
          to="https://github.com/kube/virtual"
          target="_blank"
          className="hover:scale-110 transition-transform active:scale-95"
        >
          <GithubLogo className="h-7 fill-dark dark:fill-white" />
        </Link>

        <Link
          to="https://discord.gg/Gg2QMCWX9h"
          target="_blank"
          className="hover:scale-110 transition-transform active:scale-95"
        >
          <DiscordLogo className="h-6 mt-0.5" />
        </Link>
      </div>
    </>
  );
}
