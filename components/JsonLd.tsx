/*
 * Render structured data sebagai <script type="application/ld+json">.
 * `<` di-escape supaya isi string tidak bisa menutup tag script.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
