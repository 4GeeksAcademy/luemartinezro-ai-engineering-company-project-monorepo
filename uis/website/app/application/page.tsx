import { ApplicationPage } from "../components/application-form";
import { PageFrame } from "../components/site-shell";

export default function EnquiryPage() {
  return <PageFrame locale="en" page="application"><ApplicationPage locale="en" /></PageFrame>;
}
