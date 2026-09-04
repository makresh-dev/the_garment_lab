import PaymentWaitingClient from "@/components/PaymentWaitingClient";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PaymentWaitingPage({
    params,
}: PageProps) {

    const { id } =
        await params;

    return (
        <PaymentWaitingClient
            orderId={Number(id)}
        />
    );
}