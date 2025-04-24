from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
import time

def extrair_dinamico(url):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # roda sem abrir a janela
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    # Inicializa o navegador
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get(url)

    time.sleep(5)  # espera carregar (pode ajustar)

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    driver.quit()

    # Tags de interesse na wiki
    tags_interesse = ['h1', 'h2', 'h3', 'p', 'code', 'pre', 'li']

    resultado = []
    for tag in tags_interesse:
        for el in soup.find_all(tag):
            texto = el.get_text(strip=True)
            if texto:
                resultado.append({'tipo': tag, 'conteudo': texto})

    return resultado

def salvar_json_txt(dados):
    with open('output_completo.json', 'w', encoding='utf-8') as f_json:
        json.dump(dados, f_json, indent=4, ensure_ascii=False)

    with open('output_completo.txt', 'w', encoding='utf-8') as f_txt:
        for item in dados:
            f_txt.write(f"[{item['tipo'].upper()}] {item['conteudo']}\n\n")

def main():
    url = 'https://datajud-wiki.cnj.jus.br/'
    dados = extrair_dinamico(url)
    salvar_json_txt(dados)
    print("✅ Extração finalizada com sucesso!")

if __name__ == "__main__":
    main()
