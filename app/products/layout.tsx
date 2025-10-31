export default function ProductsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode; // <- nombre del slot: "@modal"
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
