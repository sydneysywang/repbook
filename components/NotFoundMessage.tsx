import { ButtonLink } from "./Button";
import { Glow } from "./Glow";
import { Icon } from "./Icon";

type NotFoundMessageProps = {
  title?: string;
  helper?: string;
};

/** Friendly "not found" with a link home. Used for unknown addresses and ids. */
export function NotFoundMessage({
  title = "Nothing here.",
  helper = "This page doesn't exist, or it may have been deleted.",
}: NotFoundMessageProps) {
  return (
    <section className="relative isolate pt-6">
      <Glow />
      <Icon name="asterisk" size={32} className="text-orange" />
      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-3 text-muted">{helper}</p>
      <ButtonLink href="/" className="mt-8">
        Go home
      </ButtonLink>
    </section>
  );
}
