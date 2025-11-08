import tkinter as tk
from tkinter import ttk, messagebox
from pymongo import MongoClient
from datetime import datetime
from geopy.geocoders import Nominatim
class TelegramUserSearchApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Telegram Kullanıcı Arama")
        self.root.geometry("600x500")
        self.root.configure(bg='#1a1a2e')
        self.geolocator = Nominatim(user_agent="vips")
        # MongoDB bağlantısı
        try:
            self.client = MongoClient('mongodb+srv://ixel:Burak123.@tgdata.po9zm3c.mongodb.net/')
            self.db = self.client['test']
            self.collection = self.db['telegramusers']
            self.connection_status = "✅ Bağlı"
        except Exception as e:
            self.connection_status = f"❌ Hata: {str(e)}"
        
        self.create_widgets()
    
    def create_widgets(self):
        # Başlık
        title_frame = tk.Frame(self.root, bg='#1a1a2e')
        title_frame.pack(pady=20)
        
        title_label = tk.Label(
            title_frame,
            text="🔍 Kullanıcı Arama",
            font=("Arial", 24, "bold"),
            bg='#1a1a2e',
            fg='#00d4ff'
        )
        title_label.pack()
        
        # Bağlantı durumu
        status_label = tk.Label(
            title_frame,
            text=f"MongoDB: {self.connection_status}",
            font=("Arial", 10),
            bg='#1a1a2e',
            fg='#00ff88' if "✅" in self.connection_status else '#ff3333'
        )
        status_label.pack(pady=5)
        
        # Arama frame'i
        search_frame = tk.Frame(self.root, bg='#1a1a2e')
        search_frame.pack(pady=20, padx=30, fill='x')
        
        # Numara label
        phone_label = tk.Label(
            search_frame,
            text="📱 Telefon Numarası:",
            font=("Arial", 12, "bold"),
            bg='#1a1a2e',
            fg='white'
        )
        phone_label.pack(anchor='w', pady=5)
        
        # Numara entry
        self.phone_entry = tk.Entry(
            search_frame,
            font=("Arial", 14),
            bg='#16213e',
            fg='white',
            insertbackground='white',
            relief='flat',
            bd=0
        )
        self.phone_entry.pack(fill='x', ipady=10, pady=5)
        self.phone_entry.bind('<Return>', lambda e: self.search_user())
        
        # Placeholder text
        self.phone_entry.insert(0, "+90 555 123 4567")
        self.phone_entry.config(fg='gray')
        self.phone_entry.bind('<FocusIn>', self.clear_placeholder)
        self.phone_entry.bind('<FocusOut>', self.add_placeholder)
        
        # Ara butonu
        search_button = tk.Button(
            search_frame,
            text="🔍 ARA",
            font=("Arial", 12, "bold"),
            bg='#00d4ff',
            fg='white',
            activebackground='#00a8cc',
            activeforeground='white',
            cursor='hand2',
            relief='flat',
            bd=0,
            command=self.search_user
        )
        search_button.pack(pady=15, ipady=10, fill='x')
        
        # Sonuç frame'i (Canvas ile kaydırılabilir)
        result_container = tk.Frame(self.root, bg='#1a1a2e')
        result_container.pack(pady=20, padx=30, fill='both', expand=True)
        
        # Canvas oluştur
        self.canvas = tk.Canvas(result_container, bg='#16213e', highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(result_container, orient='vertical', command=self.canvas.yview)
        
        # Kaydırılabilir frame
        self.result_frame = tk.Frame(self.canvas, bg='#16213e')
        
        # Canvas'ı yapılandır
        self.result_frame.bind(
            '<Configure>',
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox('all'))
        )
        
        # Canvas içine frame ekle
        self.canvas_frame = self.canvas.create_window((0, 0), window=self.result_frame, anchor='nw')
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        # Canvas genişliğini ayarla
        self.canvas.bind('<Configure>', self.on_canvas_configure)
        
        # Pack layout
        self.canvas.pack(side='left', fill='both', expand=True)
        self.scrollbar.pack(side='right', fill='y')
        
        # Mouse wheel ile kaydırma
        self.canvas.bind_all('<MouseWheel>', self.on_mousewheel)
        self.canvas.bind_all('<Button-4>', self.on_mousewheel)
        self.canvas.bind_all('<Button-5>', self.on_mousewheel)
        
        # Başlangıç mesajı
        initial_label = tk.Label(
            self.result_frame,
            text="👆 Aramak için yukarıdan numara girin",
            font=("Arial", 12),
            bg='#16213e',
            fg='gray'
        )
        initial_label.pack(expand=True, pady=50)
    
    def on_canvas_configure(self, event):
        # Canvas genişliği değiştiğinde frame genişliğini ayarla
        self.canvas.itemconfig(self.canvas_frame, width=event.width)
    
    def on_mousewheel(self, event):
        # Windows ve Linux için mouse wheel desteği
        if event.num == 5 or event.delta < 0:
            self.canvas.yview_scroll(1, 'units')
        elif event.num == 4 or event.delta > 0:
            self.canvas.yview_scroll(-1, 'units')
    
    def clear_placeholder(self, event):
        if self.phone_entry.get() == "+90 555 123 4567":
            self.phone_entry.delete(0, tk.END)
            self.phone_entry.config(fg='white')
    
    def add_placeholder(self, event):
        if not self.phone_entry.get():
            self.phone_entry.insert(0, "+90 555 123 4567")
            self.phone_entry.config(fg='gray')
    
    def search_user(self):
        phone = self.phone_entry.get().strip()
        
        # Placeholder kontrolü
        if phone == "+90 555 123 4567" or not phone:
            messagebox.showwarning("Uyarı", "Lütfen bir telefon numarası girin!")
            return
        
        # Numarayı temizle (boşlukları ve özel karakterleri kaldır)
        clean_phone = ''.join(filter(lambda x: x.isdigit() or x == '+', phone)).replace("+","")
        
        try:
            # MongoDB'de ara
            user = self.collection.find_one({'phone': clean_phone})
            
            # Eski sonuçları temizle
            for widget in self.result_frame.winfo_children():
                widget.destroy()
            
            # Canvas'ı yukarı kaydır
            self.canvas.yview_moveto(0)
            
            if user:
                self.display_user_info(user)
            else:
                self.display_not_found()
                
        except Exception as e:
            messagebox.showerror("Hata", f"Arama sırasında hata oluştu:\n{str(e)}")
    
    def display_user_info(self, user):
        # Kullanıcı bilgi container
        info_container = tk.Frame(self.result_frame, bg='#16213e')
        info_container.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Başlık
        title = tk.Label(
            info_container,
            text="✅ KULLANICI BULUNDU",
            font=("Arial", 16, "bold"),
            bg='#16213e',
            fg='#00ff88'
        )
        title.pack(pady=(10, 20))
        location = self.geolocator.reverse(f"{user['location']['latitude']}, {user['location']['longitude']}")
        # Kullanıcı bilgileri
        info_data = [
            ("👤 Ad Soyad", f"{user.get('firstName', '')} {user.get('lastName', '')}"),
            ("📱 Telefon", user.get('phone', 'Belirtilmemiş')),
            ("🆔 Telegram ID", user.get('telegramId', 'Belirtilmemiş')),
            ("📧 Kullanıcı Adı", f"@{user.get('username', 'Yok')}" if user.get('username') else 'Belirtilmemiş'),
            ("📍 Konum", location),
            ("📅 Kayıt Tarihi", self.format_date(user.get('createdAt')))
        ]
        
        for label_text, value_text in info_data:
            # Her bilgi için frame
            item_frame = tk.Frame(info_container, bg='#0f1626')
            item_frame.pack(fill='x', pady=8, padx=10)
            
            # Label
            label = tk.Label(
                item_frame,
                text=label_text,
                font=("Arial", 11, "bold"),
                bg='#0f1626',
                fg='#00d4ff',
                anchor='w',
                wraplength=200
            )
            label.pack(side='left', padx=15, pady=12)
            
            # Value
            value = tk.Label(
                item_frame,
                text=value_text,
                font=("Arial", 11),
                bg='#0f1626',
                fg='white',
                anchor='e',
                wraplength=300
            )
            value.pack(side='right', padx=15, pady=12)
        
        # Alt boşluk (kaydırma için)
        bottom_space = tk.Label(info_container, text="", bg='#16213e', height=2)
        bottom_space.pack()
    
    def display_not_found(self):
        not_found_label = tk.Label(
            self.result_frame,
            text="❌ KULLANICI BULUNAMADI",
            font=("Arial", 14, "bold"),
            bg='#16213e',
            fg='#ff3333'
        )
        not_found_label.pack(expand=True)
        
        info_label = tk.Label(
            self.result_frame,
            text="Bu telefon numarasıyla kayıtlı kullanıcı yok",
            font=("Arial", 10),
            bg='#16213e',
            fg='gray'
        )
        info_label.pack()
    
    def format_location(self, location):
        if location and 'latitude' in location and 'longitude' in location:
            lat = location['latitude']
            lon = location['longitude']
            return f"{lat:.4f}, {lon:.4f}"
        return "Belirtilmemiş"
    
    def format_date(self, date):
        if date:
            if isinstance(date, str):
                try:
                    date = datetime.fromisoformat(date.replace('Z', '+00:00'))
                except:
                    return date
            return date.strftime("%d.%m.%Y %H:%M")
        return "Belirtilmemiş"
    
    def on_closing(self):
        # Mouse wheel binding'lerini temizle
        self.canvas.unbind_all('<MouseWheel>')
        self.canvas.unbind_all('<Button-4>')
        self.canvas.unbind_all('<Button-5>')
        
        if self.client:
            self.client.close()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = TelegramUserSearchApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()