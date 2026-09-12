import { Button } from "@/components/ui/button";
import { useChart } from "@/components/chart/context";

export function ChartSaveMarkdownButton() {
  const {
    actions: { saveMarkdown },
  } = useChart();
  return (
    <Button type="button" variant="secondary" onClick={saveMarkdown}>
      Save as Markdown
    </Button>
  );
}

export function ChartAskChatGPTButton() {
  const {
    actions: { askChatGPT },
  } = useChart();
  return (
    <Button type="button" variant="outline" onClick={askChatGPT}>
      Ask ChatGPT
    </Button>
  );
}
