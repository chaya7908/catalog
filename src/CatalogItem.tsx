import { useMemo } from "react";
import { CatalogItem } from "./types";

const CatalogItemCard: React.FC<{ item: CatalogItem; recommended?: boolean; onLoadError?: () => void }> = ({ item, recommended, onLoadError }) => {
  const handleImageError = (e: any) => {
    // Try fetching the image to check for a specific HTTP status code
    fetch(item.imgUrl)
      .then(response => {
        if (response.status === 410) {
          onLoadError?.();
        }
      })
      .catch(error => {
        onLoadError?.();
      });
  };

  const isNew = useMemo(() => {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 15);

    const createdAtDate = new Date(item.createdAt);
    return createdAtDate >= fiveDaysAgo;
  }, [item]);

  return (
    <div className={`catalog-item ${item.isSoldOut ? 'sold-out' : ''} ${recommended ? 'recommended' : ''}`} key={item.sku}>
      <span className="sku">#{item.sku}</span>
      {isNew && <span className="new-item">NEW</span>}
      <div className="img-container">
        <img src={item.imgUrl} alt={item.text} width="150" height="150" onError={handleImageError} loading="lazy" />
      </div>
      <div className="text-container">
        <span>{item.text}</span>
      </div>
    </div>
  );
};

export default CatalogItemCard;