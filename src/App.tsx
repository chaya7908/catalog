import { useEffect, useState } from "react";
import { CatalogItem } from "./types";

import './App.css';
import Loader from "./Loader";
import CatalogItemCard from "./CatalogItem";
import { AiIcon, ABCIcon, IdeaIcon, ContactUsIcon } from "./SVGIcons";

const CATALOG_URL = 'https://hook.eu2.make.com/9jtr7ztjxkoo7lvxvayckkmdlr0ck4w3';
const SUGGESTION_URL = 'https://hook.eu2.make.com/5oyeb3xxdzwrvwu6fjbhnprrfe3upvpd';

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
      const { items: responseItems }: { items: Partial<CatalogItem>[] } = await botResponse.json();
      const recommendedItems = responseItems
        .filter(item => items.find(i => i.sku === item.sku))
        .map(item => (
          { ...item, ...(items.find(i => i.sku === item.sku)) } as CatalogItem
        ));
      setRecommendedBotItems(recommendedItems);
    } catch (e) {
    } finally {
      setBotSearchDisabled(false);
    }
  }

  const [newSentence, setNewSentence] = useState<string>('');
  const [newSentenceDisabled, setNewSentenceDisabled] = useState<boolean>(false);

  const suggestSentence = async () => {
    setNewSentenceDisabled(true);
    try {
      // implement bot search
      await fetch(SUGGESTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newSentence
        })
      });
      setNewSentence('');
    } catch (e) {
    } finally {
      setNewSentenceDisabled(false);
    }
  }

  const [contactUsMessage, setContactUsMessage] = useState<string>('');
  const [contactUsEmail, setContactUsEmail] = useState<string>('');
  const [contactUsDisabled, setContactUsDisabled] = useState<boolean>(false);
  const contactUs = async () => {
    setContactUsDisabled(true);
    try {
      // implement bot search
      await fetch(SUGGESTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: contactUsMessage,
          email: contactUsEmail
        })
      });
      setContactUsMessage('');
      setContactUsEmail('');
    } catch (e) {
    } finally {
      setContactUsDisabled(false);
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
      <header>
        <img src="/catalog/bg.JPG" />
        <h1>"לפעמים הדברים
          הקטנים ביותר
          ממלאים הכי הרבה
          מקום בלב"</h1>
      </header>
      <div className="catalog">
        <div className="side-element">
          <div className="sticky-element">
            <form className="input-container" onSubmit={e => { e.preventDefault(); botSearch(); }}>
              <div className="icon-container zoom-out"><AiIcon /></div>
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
            <div className="input-container">
              <div className="icon-container"><ABCIcon /></div>
              <input
                type="text"
                placeholder="חיפוש לפי טקסט"
                value={freeSearchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreeSearchText(e.target.value)}
              />
            </div>
            <form className="input-container" onSubmit={e => { e.preventDefault(); suggestSentence(); }}>
              <div className="icon-container swing"><IdeaIcon /></div>
              <div>תרצו להציע משפט מעצים שעוד לא קיים במאגר? נשמח לשמוע :)</div>
              <input
                type="text"
                value={newSentence}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSentence(e.target.value)}
              />
              <button type="submit" disabled={!newSentence || newSentenceDisabled} onClick={suggestSentence}><>
                {newSentenceDisabled ? <Loader /> : 'שלח'}
              </>
              </button>
            </form>
            <form className="input-container" onSubmit={e => { e.preventDefault(); contactUs(); }}>
              <div className="icon-container"><ContactUsIcon /></div>
              <div>נהיה בקשר</div>
              <input
                type="text"
                placeholder="רציתי לומר ש -"
                required
                value={contactUsMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactUsMessage(e.target.value)}
              />
              <input
                type="email"
                placeholder="כתובת מייל"
                required
                value={contactUsEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactUsEmail(e.target.value)}
              />
              <button type="submit" disabled={!contactUsEmail || !contactUsMessage || contactUsDisabled} onClick={contactUs}><>
                {contactUsDisabled ? <Loader /> : 'שלח'}
              </>
              </button>
            </form>
          </div>
        </div>

        <div className="items-container">
          <div className="catalog-grid">
            {filteredItems.map(item => (
              <CatalogItemCard item={item} key={item.sku} />
            ))}
          </div>
        </div>
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
  );
};

export default App;
