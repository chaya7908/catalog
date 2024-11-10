import { CatalogItem } from "./types";

const CatalogItemCard: React.FC<{ item: CatalogItem; recommended?: boolean }> = ({ item, recommended }) => {
  return (
    <div className={`catalog-item ${item.isSoldOut ? 'sold-out' : ''} ${recommended ? 'recommended' : ''}`} key={item.sku}>
      <div className="img-container">
        <img src={item.imgUrl} alt={item.text} width="150" height="150" />
      </div>
      <div className="text-container">
        <span>{item.text}</span>
      </div>
    </div>
  );
};

export default CatalogItemCard;