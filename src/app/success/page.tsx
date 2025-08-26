export default function SuccessPage() {
  return (
    <div className="container mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold mb-2">Payment successful</h1>
      <p className="text-muted-foreground mb-6">
        Thank you for your purchase. A confirmation email will be sent shortly.
      </p>
      <a href="/market" className="text-blue-600 hover:underline">Back to Market</a>
    </div>
  );
}
