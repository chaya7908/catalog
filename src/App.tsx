import { useEffect, useState } from "react";
import { CatalogItem } from "./types";

import './App.css';
import Loader from "./Loader";
import CatalogItemCard from "./CatalogItem";
import { AiIcon, ABCIcon } from "./SVGIcons";

const CATALOG_URL = 'https://hook.eu2.make.com/9jtr7ztjxkoo7lvxvayckkmdlr0ck4w3';

const App: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [recommendedBotItems, setRecommendedBotItems] = useState<CatalogItem[]>([]);

  // free search
  const [freeSearchText, setFreeSearchText] = useState<string>('');
  const [debouncedFreeSearchText, setDebouncedFreeSearchText] = useState(freeSearchText);
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedFreeSearchText(freeSearchText); }, 500);
    return () => clearTimeout(timer);
  }, [freeSearchText]);

  // bot search
  const [botSearchText, setBotSearchText] = useState<string>('');
  const [botSearchDisabled, setBotSearchDisabled] = useState<boolean>(false);
  const botSearch = async () => {
    setBotSearchDisabled(true);
    try {
      // implement bot search
      const botResponse = await fetch(CATALOG_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: botSearchText
        })
      });
      const data: Partial<CatalogItem>[] = await botResponse.json();
      const recommendedItems = data.map(item => (
        { ...item, ...(items.find(i => i.sku === item.sku)) } as CatalogItem
      ));
      setRecommendedBotItems(recommendedItems);
    } catch (e) {
    } finally {
      setBotSearchDisabled(false);
    }
  }

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const items = localStorage.getItem('items');
      const lastFetch = localStorage.getItem('lastFetch');
      const now = Date.now();

      // Check if 24 hours have passed since the last fetch
      if (items && lastFetch && now - parseInt(lastFetch, 10) < 24 * 60 * 60 * 1000) {
        setItems(JSON.parse(items));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(CATALOG_URL);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: CatalogItem[] = await response.json();
        localStorage.setItem('items', JSON.stringify(data));
        localStorage.setItem('lastFetch', now.toString());
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    item.text.toLowerCase().includes(debouncedFreeSearchText.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="app-main-container">
      <div className="header">
        <h1>"לפעמים הדברים
          הקטנים ביותר
          ממלאים הכי הרבה
          מקום בלב"</h1>
        <div className="bot-search">
          <form className="input-container" onSubmit={e => { e.preventDefault(); botSearch(); }}>
            <div className="zoom-out" style={{ width: '20px' }}><AiIcon /></div>
            <div>אני כאן כדי לעזור לבחור את האבן המתאימה ביותר למטרה שלך. אפשר לספר לי למה היא מיועדת, ואכוון לאבן הנכונה.</div>
            <input
              type="text"
              value={botSearchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBotSearchText(e.target.value)}
            />
            <button type="submit" disabled={!botSearchText || botSearchDisabled} onClick={botSearch}><>
              {botSearchDisabled ? <Loader /> : 'חפש'}
            </>
            </button>
          </form>
        </div>
        <div className="input-container">
          <div style={{ width: '20px' }}><ABCIcon /></div>
          <input
            type="text"
            placeholder="חיפוש לפי טקסט"
            value={freeSearchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreeSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="items-container">
        <div className="catalog-grid">
          {filteredItems.map(item => (
            <CatalogItemCard item={item} key={item.sku} />
          ))}
        </div>
        {recommendedBotItems.length > 0 && <>
          <div className="overlay" onClick={() => setRecommendedBotItems([])}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setRecommendedBotItems([])}>×</button>
              <div className="recommended-items-grid scrollable-element">
                {recommendedBotItems.map(item => (
                  <div className="recommended-container">
                    <CatalogItemCard item={item} key={item.sku} recommended />
                    <div className="recomendation-text">{item.reasonForMatch}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
        }
      </div>
    </div>
  );
};

export default App;
