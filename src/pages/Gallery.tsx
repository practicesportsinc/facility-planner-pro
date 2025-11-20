import Layout from "@/components/layout/Layout";
import { FacilityPresetGallery } from "@/components/home/FacilityPresetGallery";

const Gallery = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Facility Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse our curated collection of sports facility designs. Click any facility to see detailed cost breakdowns and customize it to your needs.
          </p>
        </div>
        <FacilityPresetGallery />
      </div>
    </Layout>
  );
};

export default Gallery;
