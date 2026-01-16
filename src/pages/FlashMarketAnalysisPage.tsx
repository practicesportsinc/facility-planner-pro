import Layout from "@/components/layout/Layout";
import { FlashMarketAnalysis } from "@/components/market/FlashMarketAnalysis";

const FlashMarketAnalysisPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <FlashMarketAnalysis />
      </div>
    </Layout>
  );
};

export default FlashMarketAnalysisPage;
