import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Wallet, Shield, Lock } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const cardSchema = z.object({
  cardNumber: z.string().min(16, "Invalid card number").max(19),
  cardHolder: z.string().min(3, "Cardholder name is required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Use MM/YY format"),
  cvv: z.string().min(3, "CVV is required").max(4),
});

export type CardFormData = z.infer<typeof cardSchema>;

interface PaymentFormProps {
  amount: number;
  onSubmit: (method: string, data?: CardFormData) => void;
  isLoading?: boolean;
}

export function PaymentForm({ amount, onSubmit, isLoading }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardPreview, setCardPreview] = useState({
    number: "",
    holder: "",
    expiry: "",
  });

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    }
    return value;
  };

  const handleCardSubmit = (data: CardFormData) => {
    onSubmit("card", data);
  };

  const handleWalletSubmit = () => {
    onSubmit("wallet");
  };

  return (
    <div className="space-y-6">
      <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card" data-testid="tab-card">
            <CreditCard className="h-4 w-4 mr-2" />
            Credit Card
          </TabsTrigger>
          <TabsTrigger value="wallet" data-testid="tab-wallet">
            <Wallet className="h-4 w-4 mr-2" />
            Digital Wallet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="space-y-6 mt-6">
          <div
            className={cn(
              "relative h-48 w-full max-w-sm mx-auto rounded-2xl p-6",
              "bg-gradient-to-br from-primary via-primary to-primary/80",
              "text-primary-foreground shadow-lg"
            )}
          >
            <div className="absolute top-4 right-4">
              <CreditCard className="h-8 w-8 opacity-50" />
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-lg tracking-widest font-mono mb-4" data-testid="text-card-preview-number">
                {cardPreview.number || "•••• •••• •••• ••••"}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-70">Card Holder</p>
                  <p className="text-sm font-medium uppercase" data-testid="text-card-preview-holder">
                    {cardPreview.holder || "YOUR NAME"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70">Expires</p>
                  <p className="text-sm font-medium" data-testid="text-card-preview-expiry">
                    {cardPreview.expiry || "MM/YY"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCardSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          field.onChange(formatted);
                          setCardPreview((prev) => ({ ...prev, number: formatted }));
                        }}
                        maxLength={19}
                        data-testid="input-card-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setCardPreview((prev) => ({ ...prev, holder: e.target.value }));
                        }}
                        data-testid="input-card-holder"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MM/YY"
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + "/" + value.slice(2, 4);
                            }
                            field.onChange(value);
                            setCardPreview((prev) => ({ ...prev, expiry: value }));
                          }}
                          maxLength={5}
                          data-testid="input-expiry"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="•••"
                          {...field}
                          maxLength={4}
                          data-testid="input-cvv"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isLoading}
                data-testid="button-pay-card"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Pay ${amount.toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="wallet" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Digital Wallet Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Complete your payment securely using your digital wallet balance.
              </p>
              <Button
                className="w-full h-12"
                onClick={handleWalletSubmit}
                disabled={isLoading}
                data-testid="button-pay-wallet"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Pay ${amount.toFixed(2)} with Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span>PCI Compliant</span>
        </div>
      </div>
    </div>
  );
}
