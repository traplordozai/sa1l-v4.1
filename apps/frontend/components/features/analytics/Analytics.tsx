import Script from "next/script"

export default function Analytics() {
  return (
    <>
      {/* Example: Plausible */}
      <Script async defer data-domain="yourdomain.com" src="https://plausible.io/js/plausible.js" />
    </>
  )
}

