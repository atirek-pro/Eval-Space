import ByodWorkspace from "@/components/ByodWorkspace";

export const metadata = {
  title: "Bring-Your-Own-Data · Compare Models · Eval Space",
};

// Bring-Your-Own-Data: upload questions, choose the models that answer them, run the comparison.
export default function ByodPage() {
  return (
    <div className="app__page byod">
      <h1 id="byod-h" className="sr-only">Compare Models: Bring-Your-Own-Data</h1>
      <ByodWorkspace />
    </div>
  );
}
