import CompareModels from "@/components/CompareModels";

export const metadata = {
  title: "Compare Models · Eval Space",
};

export default function CompareModelsPage() {
  return (
    <div className="app__page compare">
      <h1 id="compare-h" className="sr-only">Compare Models</h1>
      <p className="compare__howto">
        <strong>How to use:</strong> pick a model in each chat, send both the same message, and compare their
        replies side by side.
      </p>
      <CompareModels />
    </div>
  );
}
