import ModalContainer from "@/components/modal/ModalContainer";
import UnlockOnMount from "@/components/common/UnlockOnMount";
// 👇 Sube dos niveles desde @modal/(.)[slug] hasta products/[slug]/page
import ProductDetailPage from "../../[slug]/page";
import { JSX } from "react";
type PDP = (p: { params: Promise<{ slug: string }> }) => JSX.Element;
const PDPComp = ProductDetailPage as unknown as PDP;
export default async function ProductModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // En Next 16 los params son Promise
  const { slug } = await params;

  return (
    <ModalContainer onClosePath="/products">
      {/* asegura que el “lock” del body se libere si el usuario cierra/navega */}
      <UnlockOnMount />
      {/* Reutilizamos el PDP de server pasándole el slug que ya resolvimos */}
      <PDPComp params={Promise.resolve({ slug })} />
    </ModalContainer>
  );
}
