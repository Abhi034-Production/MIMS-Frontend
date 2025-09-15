import React from "react";
import { Helmet } from "react-helmet-async";

const Seo = ({
  title = "easyinventory",
  description = "Manage your business inventory easily with easyinventory.",
  keywords = "inventory, stock management, easyinventory, business management",
  url = "https://easyinventory.online",
  type = "website",
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
   

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />

    </Helmet>
  );
};

export default Seo;
