export default function CancelPage() {
  return (
    <div className="container mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold mb-2">Payment canceled</h1>
      <p className="text-muted-foreground mb-6">
        Your payment was canceled. You can continue shopping and try again.
      </p>
      <a href="/market" className="text-blue-600 hover:underline">Back to Market</a>
    </div>
  );
}
