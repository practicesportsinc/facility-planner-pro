import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const galleryImages = [
  {
    src: "/images/home-gallery/facility-1.jpg",
    alt: "Modern sports facility interior with basketball court"
  },
  {
    src: "/images/home-gallery/facility-2.jpg", 
    alt: "Professional sports facility with multiple courts"
  },
  {
    src: "/images/home-gallery/facility-3.jpg",
    alt: "State-of-the-art training facility equipment"
  },
  {
    src: "/images/home-gallery/facility-4.jpg",
    alt: "Spacious indoor sports complex"
  },
  {
    src: "/images/home-gallery/facility-5.jpg",
    alt: "Multi-purpose athletic facility design"
  }
];

export function HomeImageScroller() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {galleryImages.map((image, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden border-0 shadow-custom-medium hover:shadow-custom-large transition-smooth">
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="object-cover w-full h-full rounded-lg"
                    loading="lazy"
                  />
                </AspectRatio>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}