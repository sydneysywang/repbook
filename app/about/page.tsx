import { GlowOrb } from "@/components/GlowOrb";
import { Icon } from "@/components/Icon";

export default function AboutPage() {
  return (
    <>
      <GlowOrb>
        <div className="max-w-sm text-center">
          <p className="text-4xl font-bold tracking-tight md:text-5xl">
            Lift. Log.
            <br />
            Repeat.
          </p>
        </div>
      </GlowOrb>

      <section className="border-t border-rule py-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Icon name="asterisk" size={20} className="text-orange" />
          About Repbook
        </h1>
        <p className="mt-3 text-muted">
          Repbook is for people who want to get a good workout in and get on with their day. Maybe
          you train two or three times a week, maybe at a couple of different gyms.
        </p>
        <p className="mt-3 text-muted">
          Save the routines you do most, fill in your reps and weight as you go, and see what you
          lifted last time so you know what to aim for. Using a different machine at another gym?
          Add it as a variation and Repbook keeps its numbers separate.
        </p>
      </section>

      <section className="border-t border-rule py-8">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Icon name="asterisk" size={18} className="text-orange" />
          Your workouts stay with you
        </h2>
        <p className="mt-3 text-muted">
          No account, no sign-up. Everything you log is saved right here in this browser and never
          leaves your device.
        </p>
        <p className="mt-3 text-muted">
          That also means a few things to keep in mind. Workouts you log on your laptop won&apos;t
          show up on your phone. Clearing your browser data will erase them. And Safari can clear
          them on its own if you haven&apos;t opened Repbook in about a week.
        </p>
      </section>
    </>
  );
}
