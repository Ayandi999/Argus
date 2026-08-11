import Razorpay from 'razorpay';

let razorpay: Razorpay | null = null;

export function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY!,
      key_secret: process.env.RAZORPAY_API_SECRET!,
    });
  }

  return razorpay;
}
