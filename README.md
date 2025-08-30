# LST Genesis ICO Presale Website

Bu proje, LST token'ının önsatış (ICO) süreci için tasarlanmış modern bir web sitesidir.

## Özellikler

- **Token Hesaplayıcı**: Kullanıcılar istedikleri LST miktarını girerek ödemeleri gereken tutarı görebilirler
- **Geri Sayım Zamanlayıcısı**: ICO'nun bitiş tarihine kalan süreyi gösterir
- **Modern Tasarım**: Gri/siyah tonlarda şık ve profesyonel görünüm
- **Responsive Tasarım**: Mobil ve masaüstü cihazlarda mükemmel görünüm
- **İnteraktif Butonlar**: "How it works" ve "Buy $LST" butonları

## Dosya Yapısı

```
presale-website/
├── index.html          # Ana HTML dosyası
├── style.css           # CSS stilleri
├── script.js           # JavaScript fonksiyonları
└── README.md           # Bu dosya
```

## Kurulum

1. Dosyaları bilgisayarınıza indirin
2. `index.html` dosyasını bir web tarayıcısında açın
3. Site otomatik olarak çalışmaya başlayacaktır

## Özelleştirme

### Token Fiyatını Değiştirme
`script.js` dosyasında `TOKEN_PRICE_USD` değişkenini değiştirin:
```javascript
const TOKEN_PRICE_USD = 0.1; // Token fiyatını buradan değiştirin
```

### Geri Sayım Tarihini Değiştirme
`script.js` dosyasında `countdownEndDate` değişkenini değiştirin:
```javascript
const countdownEndDate = new Date('2024-12-31T23:59:59').getTime();
```

### Arkaplan Resmi Ekleme
`style.css` dosyasında `body` seçicisinde `background` özelliğini değiştirin:
```css
body {
    background: url('your-background-image.jpg') center/cover;
    /* veya */
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}
```

## Teknolojiler

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript
- Google Fonts (Inter)

## Lisans

Bu proje açık kaynak kodludur ve kişisel veya ticari projelerde kullanılabilir.

## Destek

Herhangi bir sorun yaşarsanız veya özelleştirme konusunda yardıma ihtiyacınız varsa, lütfen iletişime geçin.
