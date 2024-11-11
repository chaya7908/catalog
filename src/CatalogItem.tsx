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

  return (
    <div className={`catalog-item ${item.isSoldOut ? 'sold-out' : ''} ${recommended ? 'recommended' : ''}`} key={item.sku}>
      <span className="sku">#{item.sku}</span>
      <div className="img-container">
        <img src={item.imgUrl} alt={item.text} width="150" height="150" onError={handleImageError}  />
      </div>
      <div className="text-container">
        <span>{item.text}</span>
      </div>
    </div>
  );
};

export default CatalogItemCard;