import { ApplicationPage } from "../../components/application-form";
import { PageFrame } from "../../components/site-shell";

export default function SpanishEnquiryPage() {
  return <PageFrame locale="es" page="application"><ApplicationPage locale="es" /></PageFrame>;
}
