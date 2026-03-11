declare module "razorpay" {
    interface RazorpayOptions {
        key_id: string;
        key_secret: string;
    }

    interface RazorpayOrderCreateOptions {
        amount: number;
        currency: string;
        receipt?: string;
        notes?: Record<string, string>;
    }

    interface RazorpayOrder {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        receipt?: string;
        notes?: Record<string, string>;
        created_at: number;
    }

    class Razorpay {
        constructor(options: RazorpayOptions);
        orders: {
            create(options: RazorpayOrderCreateOptions): Promise<RazorpayOrder>;
            fetch(orderId: string): Promise<RazorpayOrder>;
        };
    }

    export = Razorpay;
}
