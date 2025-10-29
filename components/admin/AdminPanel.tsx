

import React, { useState } from 'react';
import { AppData, GalleryImage, MenuItem, MenuCategory } from '../../types';
import { fileToBase64, generateCaptionSuggestions, generateSingleCaption } from '../../services';

// --- ICONS ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 01.866.502l1.266 2.576a1 1 0 00.758.548l2.84.413a1 1 0 01.554 1.705l-2.054 1.998a1 1 0 00-.288.885l.484 2.828a1 1 0 01-1.451 1.054L10 13.633l-2.545 1.338a1 1 0 01-1.45-1.054l.483-2.828a1 1 0 00-.288-.885l-2.054-1.998a1 1 0 01.554-1.705l2.84-.413a1 1 0 00.758-.548L9.134 3.502A1 1 0 0110 3z" clipRule="evenodd" />
    </svg>
);


// --- PROPS INTERFACE ---
interface AdminPanelProps {
  data: AppData;
  onSave: (newData: AppData) => void;
  onClose: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

// --- ADMIN PANEL COMPONENT ---
export default function AdminPanel({ data, onSave, onClose, isLoggedIn, setIsLoggedIn }: AdminPanelProps) {
  const [editedData, setEditedData] = useState<AppData>(data);
  
  if (!isLoggedIn) {
    return <LoginModal setIsLoggedIn={setIsLoggedIn} onClose={onClose} />;
  }

  const handleSave = () => {
    onSave(editedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-lg shadow-2xl flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold font-heading">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
            >
              Save & Close
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon/></button>
          </div>
        </header>
        <main className="flex-grow overflow-hidden">
          <Dashboard data={editedData} setData={setEditedData} />
        </main>
      </div>
    </div>
  );
}

// --- LOGIN MODAL ---
const LoginModal = ({ setIsLoggedIn, onClose }: { setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>, onClose: () => void }) => {
    const [secretKey, setSecretKey] = useState('');
    const [error, setError] = useState('');
    const SECRET_KEY = "1234"; // Simple secret key

    const handleLogin = () => {
        if (secretKey === SECRET_KEY) {
            sessionStorage.setItem('generalis_admin_auth', 'true');
            setIsLoggedIn(true);
        } else {
            setError('Incorrect secret key.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[101] flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-2xl font-bold mb-4 text-center">Admin Login</h3>
                <p className="text-center text-sm text-gray-600 mb-6">Enter the secret key to access the dashboard.</p>
                <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Secret Key"
                    className="w-full border p-2 rounded-md mb-4"
                />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-between">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleLogin} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-80">Login</button>
                </div>
            </div>
        </div>
    );
};


// --- DASHBOARD (TABS) ---
const Dashboard = ({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) => {
    const [activeTab, setActiveTab] = useState('General');
    const tabs = ['General', 'Menu', 'Events', 'Gallery', 'Team', 'Testimonials'];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'General': return <GeneralTab data={data} setData={setData} />;
            case 'Menu': return <MenuTab data={data.menu} setData={menuData => setData(prev => ({...prev, menu: menuData}))} />;
            case 'Events': return <ListEditorTab title="Events" items={data.events} setItems={items => setData(prev => ({...prev, events: items}))} itemSchema={{image: '', title: '', date: '', description: ''}} />;
            case 'Gallery': return <GalleryTab images={data.gallery} setImages={images => setData(prev => ({...prev, gallery: images}))} />;
            case 'Team': return <ListEditorTab title="Team" items={data.team} setItems={items => setData(prev => ({...prev, team: items}))} itemSchema={{image: '', name: '', role: '', bio: ''}} />;
            case 'Testimonials': return <ListEditorTab title="Testimonials" items={data.testimonials} setItems={items => setData(prev => ({...prev, testimonials: items}))} itemSchema={{quote: '', author: '', location: ''}} />;
            default: return null;
        }
    };

    return (
        <div className="flex h-full">
            <aside className="w-48 bg-gray-50 border-r p-4">
                <nav className="flex flex-col space-y-2">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-left font-semibold transition-colors ${activeTab === tab ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </aside>
            <div className="flex-grow p-6 overflow-y-auto">
                {renderTabContent()}
            </div>
        </div>
    );
};

// --- FORM COMPONENTS ---
// FIX: Update component prop types to use React.FC and an explicit interface to resolve typing issues.
interface InputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const Input: React.FC<InputProps> = ({ label, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type="text" value={value} onChange={onChange} className="w-full border p-2 rounded-md" />
    </div>
);

// FIX: Update component prop types to use React.FC and an explicit interface to resolve typing issues.
interface TextareaProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
}
const Textarea: React.FC<TextareaProps> = ({ label, value, onChange, rows = 5 }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea value={value} onChange={onChange} rows={rows} className="w-full border p-2 rounded-md"></textarea>
    </div>
);

// --- TAB COMPONENTS ---

const GeneralTab = ({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) => (
    <div>
        <h3 className="text-xl font-bold mb-4">General Settings</h3>
        <Input label="Hero Title (HTML allowed)" value={data.hero.title} onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))} />
        <Input label="Hero Subtitle" value={data.hero.subtitle} onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, subtitle: e.target.value } }))} />
        <Textarea label="About Section" value={data.about} onChange={e => setData(prev => ({ ...prev, about: e.target.value }))} />
        <Textarea label="Specials (HTML allowed)" rows={10} value={data.specials} onChange={e => setData(prev => ({ ...prev, specials: e.target.value }))} />
        <Input label="Contact Address" value={data.contact.address} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))} />
        <Input label="Contact Phone" value={data.contact.phone} onChange={e => setData(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))} />
        <Textarea label="House Rules (one per line)" value={data.rules.join('\n')} onChange={e => setData(prev => ({ ...prev, rules: e.target.value.split('\n') }))} />
    </div>
);

const MenuTab = ({ data, setData }: { data: AppData['menu']; setData: (menuData: AppData['menu']) => void }) => {
    const handleCategoryChange = <T extends keyof AppData['menu']>(menuType: T, catIndex: number, field: keyof MenuCategory, value: string) => {
        const newMenu = { ...data };
        (newMenu[menuType][catIndex] as any)[field] = value;
        setData(newMenu);
    };

    const handleItemChange = <T extends keyof AppData['menu']>(menuType: T, catIndex: number, itemIndex: number, field: keyof MenuItem, value: string) => {
        const newMenu = { ...data };
        (newMenu[menuType][catIndex].items[itemIndex] as any)[field] = value;
        setData(newMenu);
    };
    
    const handleAddItem = <T extends keyof AppData['menu']>(menuType: T, catIndex: number) => {
        const newMenu = { ...data };
        newMenu[menuType][catIndex].items.push({ name: 'New Item', price: 'KSh 0' });
        setData(newMenu);
    };

    const handleRemoveItem = <T extends keyof AppData['menu']>(menuType: T, catIndex: number, itemIndex: number) => {
        const newMenu = { ...data };
        newMenu[menuType][catIndex].items.splice(itemIndex, 1);
        setData(newMenu);
    };

    const renderCategory = <T extends keyof AppData['menu']>(menuType: T, category: MenuCategory, catIndex: number) => (
        <div key={catIndex} className="bg-gray-100 p-4 rounded-lg mb-4">
            <Input label="Category Title" value={category.title} onChange={(e) => handleCategoryChange(menuType, catIndex, 'title', e.target.value)} />
            {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="grid grid-cols-12 gap-2 items-end border-t pt-2 mt-2">
                    <div className="col-span-4"><Input label="Item Name" value={item.name} onChange={(e) => handleItemChange(menuType, catIndex, itemIndex, 'name', e.target.value)} /></div>
                    <div className="col-span-3"><Input label="Price" value={item.price} onChange={(e) => handleItemChange(menuType, catIndex, itemIndex, 'price', e.target.value)} /></div>
                    <div className="col-span-4"><Input label="Image URL (optional)" value={item.image || ''} onChange={(e) => handleItemChange(menuType, catIndex, itemIndex, 'image', e.target.value)} /></div>
                    <button onClick={() => handleRemoveItem(menuType, catIndex, itemIndex)} className="col-span-1 bg-red-500 text-white rounded h-10 mb-4">X</button>
                </div>
            ))}
            <button onClick={() => handleAddItem(menuType, catIndex)} className="mt-2 bg-green-500 text-white px-4 py-1 rounded">Add Item</button>
        </div>
    );
    
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Menu Editor</h3>
            <div className="mb-8">
                <h4 className="font-bold text-lg mb-2">Menu Overview</h4>
                {data.overview.map((cat, i) => renderCategory('overview', cat, i))}
            </div>
            <div>
                <h4 className="font-bold text-lg mb-2">Full Menu</h4>
                {data.fullMenu.map((cat, i) => renderCategory('fullMenu', cat, i))}
            </div>
        </div>
    );
};

const GalleryTab = ({ images, setImages }: { images: GalleryImage[]; setImages: (images: GalleryImage[]) => void }) => {
    const [generating, setGenerating] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<{ index: number; captions: string[] } | null>(null);
    const [generatingAll, setGeneratingAll] = useState(false);

    const handleImageChange = (index: number, field: keyof GalleryImage, value: string) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], [field]: value };
        setImages(newImages);
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        if(e.target.files?.[0]){
            const base64 = await fileToBase64(e.target.files[0]);
            if (index !== undefined) {
                handleImageChange(index, 'src', base64);
            } else {
                setImages([...images, { src: base64, caption: '' }]);
            }
        }
    };

    const handleGenerateClick = async (index: number) => {
        setGenerating(index);
        setSuggestions(null);
        const captions = await generateCaptionSuggestions(images[index].src);
        setSuggestions({ index, captions });
        setGenerating(false);
    };
    
    const handleGenerateAll = async () => {
        setGeneratingAll(true);
        const newImages = [...images];
        for (let i = 0; i < newImages.length; i++) {
            if (!newImages[i].caption) {
                const caption = await generateSingleCaption(newImages[i].src);
                newImages[i].caption = caption;
            }
        }
        setImages(newImages);
        setGeneratingAll(false);
    };

    const applySuggestion = (index: number, caption: string) => {
        handleImageChange(index, 'caption', caption);
        setSuggestions(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gallery Editor</h3>
                <button onClick={handleGenerateAll} disabled={generatingAll} className="bg-purple-500 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 disabled:bg-purple-300">
                   {generatingAll ? 'Generating...' : <> <SparklesIcon /> Generate All Missing Captions</>}
                </button>
            </div>
            {images.map((img, index) => (
                <div key={index} className="flex gap-4 items-start border-b pb-4 mb-4">
                    <img src={img.src} alt="thumbnail" className="w-32 h-32 object-cover rounded-md" />
                    <div className="flex-grow">
                        <Input label="Caption" value={img.caption} onChange={e => handleImageChange(index, 'caption', e.target.value)} />
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleGenerateClick(index)} disabled={generating === index} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1">
                                {generating === index ? 'Generating...' : <><SparklesIcon /> Generate Suggestions</>}
                            </button>
                             <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, index)} className="text-sm" />
                        </div>
                        {suggestions?.index === index && (
                            <div className="mt-2 bg-gray-100 p-2 rounded-md">
                                <p className="font-semibold text-sm mb-1">Suggestions:</p>
                                <ul className="flex flex-wrap gap-2">
                                    {suggestions.captions.map((cap, i) => (
                                        <li key={i}><button onClick={() => applySuggestion(index, cap)} className="text-sm bg-white border rounded-full px-3 py-1 hover:bg-gray-200">{cap}</button></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ))}
             <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Add New Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} />
            </div>
        </div>
    );
};


const ListEditorTab = <T extends object>({ title, items, setItems, itemSchema }: { title: string; items: T[]; setItems: (items: T[]) => void; itemSchema: T }) => {
    
    const handleChange = (index: number, field: keyof T, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, itemSchema]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };
    
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">{title} Editor</h3>
            {items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border relative">
                    {Object.keys(itemSchema).map(key => {
                        const fieldKey = key as keyof T;
                        const isTextArea = key === 'bio' || key === 'description' || key === 'quote';
                        return isTextArea ? (
                             <Textarea key={String(fieldKey)} label={String(fieldKey)} value={String(item[fieldKey])} onChange={e => handleChange(index, fieldKey, e.target.value)} />
                        ) : (
                             <Input key={String(fieldKey)} label={String(fieldKey)} value={String(item[fieldKey])} onChange={e => handleChange(index, fieldKey, e.target.value)} />
                        );
                    })}
                    <button onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                </div>
            ))}
            <button onClick={handleAddItem} className="bg-green-500 text-white px-4 py-2 rounded-md">Add New {title.slice(0, -1)}</button>
        </div>
    );
};
