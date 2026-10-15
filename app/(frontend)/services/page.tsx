import { getSiteChrome } from "@/lib/site-content";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("Services", "Explore the services available from Vertix Commerce and find support for your business.", "/services");

export default async function Services() {
  const { services } = await getSiteChrome();
  return <main>
    <section className="bg-blue-50 py-14 md:py-20"><div className="container">
      <p className="eyebrow">Vertix Commerce</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Our services</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Explore our services and find the support that fits your business.</p>
    </div></section>
    <section className="py-14 md:py-20"><div className="container">
      {services.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map(service =>
        <article key={service.slug} className="card flex flex-col p-7">
          <h2 className="text-xl font-bold"><a href={"/services/" + service.slug}>{service.title}</a></h2>
          <p className="mt-4 flex-1 leading-7 text-slate-600">{service.text}</p>
          <a href={"/services/" + service.slug} className="mt-6 font-semibold text-blue-700">Explore service <span aria-hidden="true">→</span></a>
        </article>
      )}</div> : <div className="card p-8">
        <h2 className="text-2xl font-bold">Discuss the support you need</h2>
        <p className="mt-4 leading-7 text-slate-600">The service list is currently unavailable. Contact us to discuss your requirements.</p>
        <a href="/contact?intent=services" className="button button-primary mt-6">Discuss our services</a>
      </div>}
    </div></section>
  </main>;
}
