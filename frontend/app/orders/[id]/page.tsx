import OrderDetailClient from "@/components/OrderDetailClient";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function OrderDetailPage({
    params,
}: PageProps) {

    const { id } =
        await params;

    return (
        <OrderDetailClient
            orderId={Number(id)}
        />
    );
}