import { permanentRedirect } from "next/navigation";

/** The domain index lives on /divine-domains; /gods-of is only a URL prefix. */
export default function GodsOfIndex() {
  permanentRedirect("/divine-domains");
}
