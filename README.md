# AIgram Private — GitHub Pages

Gotowy prywatny projekt symulowanego social media do uruchomienia przez GitHub Pages.

## Publikacja
1. Utwórz nowe repozytorium na GitHubie, np. `aigram-private`.
2. Wrzuć do głównego katalogu repozytorium pliki `index.html` i `.nojekyll`.
3. Wejdź w **Settings → Pages**.
4. W **Build and deployment** wybierz **Deploy from a branch**.
5. Wybierz branch `main` i folder `/ (root)`, potem **Save**.
6. Po publikacji otwieraj aplikację zawsze z tego samego adresu GitHub Pages w Vivaldi.

## Ważne
- Dane zapisują się w IndexedDB przeglądarki przypisanej do stałego adresu HTTPS.
- Nie czyść danych witryny Vivaldi dla adresu GitHub Pages, jeśli chcesz zachować stan.
- Zdjęcia użytkownika są kompresowane przed zapisem.
- GitHub Pages jest statycznym hostingiem. Nie umieszczaj w `index.html` żadnych sekretów ani kluczy API.

## Funkcje
- duży zmienny Home feed,
- 120 profili AI i ok. 160 postów startowych,
- nowe posty AI przy odświeżeniu,
- własne posty i zakładka „Moje posty”,
- wzrost followersów po każdym poście,
- dużo komentarzy AI,
- odpowiadanie na komentarze,
- Stories, wyświetlenia i odpowiedzi AI,
- DM,
- trwały zapis IndexedDB.
