import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface Quote {
  quote: string;
  author: string;
}

export function DailyQuote() {
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");
  
  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: ["/api/quote"],
  });

  return (
    <Card className="bg-gradient-pastel-reverse shadow-md">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-primary-foreground font-medium">{currentDate}</p>
            <h3 className="text-xl font-bold mt-1">Daily Inspiration</h3>
            {isLoading ? (
              <div className="h-16 flex items-center">
                <p className="text-muted-foreground">Loading inspiration...</p>
              </div>
            ) : quote ? (
              <>
                <p className="mt-2 text-gray-700 italic">"{quote.quote}"</p>
                <p className="text-sm text-primary-foreground mt-1">— {quote.author}</p>
              </>
            ) : (
              <p className="mt-2 text-gray-700 italic">
                "The purpose of our lives is to be happy."
                <span className="block text-sm text-primary-foreground mt-1">— Dalai Lama</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
