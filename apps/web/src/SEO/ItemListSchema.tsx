import React from "react";
import { Helmet } from "react-helmet-async";

interface ListItem {
  name: string;
  url: string;
  image?: string;
  description?: string;
}

interface ItemListSchemaProps {
  listName: string;
  description: string;
  items: ListItem[];
  url: string;
}

const ItemListSchema: React.FC<ItemListSchemaProps> = ({ 
  listName, 
  description, 
  items, 
  url 
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "description": description,
    "url": url,
    "numberOfItems": items.length,
    "itemListElement": items.slice(0, 20).map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "url": item.url,
      "image": item.image,
      "description": item.description
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default ItemListSchema; 