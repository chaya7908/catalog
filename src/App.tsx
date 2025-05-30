import { useEffect, useState } from "react";
import { CatalogItem } from "./types";

import './App.css';
import Loader from "./Loader";
import CatalogItemCard from "./CatalogItem";
import { AiIcon, ABCIcon, IdeaIcon, ContactUsIcon } from "./SVGIcons";
import { ToastContainer, toast } from "react-toastify";
import MenuAction from "./MenuAction";

const CATALOG_URL = 'https://hook.eu2.make.com/jkjm3zo6boa0cjvs8mqnf877ylg7n4ox';
const SUGGESTION_URL = 'https://hook.eu2.make.com/7rw623qg1q8ylg4xbp2siq27io2qdy4e';

const App: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [recommendedBotItems, setRecommendedBotItems] = useState<CatalogItem[]>([]);
  const [activeAction, setActiveAction] = useState<'search' | 'bot-search' | 'suggest-sentence' | 'contact-us'>('bot-search');

  const fetchItems = async (force = false) => {
    const items = localStorage.getItem('items');
    const lastFetch = localStorage.getItem('lastFetch');
    const now = Date.now();

    // Check if 24 hours have passed since the last fetch
    if (!force && items && lastFetch && now - parseInt(lastFetch, 10) < 24 * 60 * 60 * 1000) {
      setItems(JSON.parse(items));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(CATALOG_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: 'get-items',
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: CatalogItem[] = await response.json();
      localStorage.setItem('items', JSON.stringify(data));
      localStorage.setItem('lastFetch', now.toString());
      setBrokenItems(0);
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          requestId: 'bot-search',
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

  // suggestion
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
          requestId: 'suggest-sentence',
          message: newSentence
        })
      });

      toast.success('תודה שכתבת לנו!');
      setNewSentence('');
    } catch (e) {
    } finally {
      setNewSentenceDisabled(false);
    }
  }

  // contact us
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
          requestId: 'contact-us',
          message: contactUsMessage,
          email: contactUsEmail
        })
      });
      toast.success('פנייתך התקבלה, נחזור אליך בהקדם');

      setContactUsMessage('');
      setContactUsEmail('');
    } catch (e) {
    } finally {
      setContactUsDisabled(false);
    }
  }

  const [brokenItems, setBrokenItems] = useState<number>(0);
  useEffect(() => {
    console.log(brokenItems, items.length);
    if (brokenItems > items.length / 2) {
      fetchItems(true);
    }
  }, [brokenItems, items]);


  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items
    .filter(item =>
      item.text.toLowerCase().includes(debouncedFreeSearchText.toLowerCase())
    ).sort((a, b) => Number(b.sku) - Number(a.sku));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="app-main-container">
      <header>
        <img src="/catalog/bg.JPG" alt="backgound" />
        <h1>"לפעמים הדברים
          הקטנים ביותר
          ממלאים הכי הרבה
          מקום בלב ❣️"</h1>
      </header>
      <div className="catalog">
        <div className="side-element">
          <div className="sticky-element">
            <MenuAction
              onClick={() => setActiveAction('bot-search')}
              isActive={activeAction === 'bot-search'}
              text="חיפוש חכם" icon={<AiIcon />}
              component={<form className="input-container" onSubmit={e => { e.preventDefault(); botSearch(); }}>
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
              </form>} />
            <MenuAction
              onClick={() => setActiveAction('search')}
              isActive={activeAction === 'search'}
              text="חיפוש חופשי" icon={<ABCIcon />}
              component={
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="חיפוש לפי טקסט"
                    value={freeSearchText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreeSearchText(e.target.value)}
                  />
                </div>
              } />
            <MenuAction
              onClick={() => setActiveAction('suggest-sentence')}
              isActive={activeAction === 'suggest-sentence'}
              text="הצעת משפט" icon={<IdeaIcon />}
              component={
                <form className="input-container" onSubmit={e => { e.preventDefault(); suggestSentence(); }}>
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
              } />
            <MenuAction
              onClick={() => setActiveAction('contact-us')}
              isActive={activeAction === 'contact-us'}
              text="צור קשר" icon={<ContactUsIcon />}
              component={
                <form className="input-container" onSubmit={e => { e.preventDefault(); contactUs(); }}>
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
              } />
          </div>
        </div>

        <div className="items-container">
          <div className="catalog-grid">
            {filteredItems.map(item => (
              <CatalogItemCard item={item} key={item.sku} onLoadError={() => {
                setBrokenItems((prevCount) => prevCount + 1);
              }} />
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

      <ToastContainer />
    </div>
  );
};

export default App;
