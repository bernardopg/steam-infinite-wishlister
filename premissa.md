# Workflow do Explorer da Steam

Objetivo: automatizar a navegação da Discovery Queue da Steam em segundo plano, identificar jogos com cartas colecionáveis, adicioná-los à wishlist e seguir para o próximo item até a fila terminar. Quando a fila acabar, o fluxo deve reiniciar e continuar em loop.

## Fluxo principal

1. Abrir `https://store.steampowered.com/explore/`.
2. Clicar em “Começar a explorar a sua lista”.
3. Aguardar o carregamento da página do jogo atual.
4. Verificar se o jogo possui cartas colecionáveis Steam.
5. Se houver cartas colecionáveis, clicar em “+ Lista de desejos”.
6. Clicar em “Próximo da lista” para avançar.
7. Repetir o processo até a fila terminar.
8. Quando aparecer “Iniciar outra lista >>”, reiniciar a queue e continuar o loop.

## Elementos importantes da interface

### Início da Discovery Queue

```html
<a id="discovery_queue_start_link" class="discovery_queue_overlay" onclick="BeginDiscoveryQueue( 0, this); return false;" href="https://store.steampowered.com/app/2776090/Lay_of_the_Land/?snr=1_239_4__1324&amp;queue=1">
						<div class="discovery_queue_overlay_position">
							<div class="discovery_queue_overlay_bg">
								<div class="discovery_queue_overlay_message">
									Clique aqui para começar a explorar a sua lista
                  </div>
							</div>
						</div>
					</a>
```

### Indicador de cartas colecionáveis

```html
<a class="game_area_details_specs_ctn" data-panel="{&quot;flow-children&quot;:&quot;column&quot;}" href="https://store.steampowered.com/search/?category2=29&amp;snr=1_5_9__423"><div class="icon"><img class="category_icon" src="https://store.fastly.steamstatic.com/public/images/v6/ico/ico_cards.png" alt=""></div><div class="label">Cartas Colecionáveis Steam</div></a>
```

### Botão de wishlist

```html
<div id="add_to_wishlist_area">
									<a class="btnv6_blue_hoverfade btn_medium add_to_wishlist" href="javascript:AddToWishlist( 2280350, 'add_to_wishlist_area', 'add_to_wishlist_area_success', 'add_to_wishlist_area_fail', &quot;1_5_9__1324&quot;, 'add_to_wishlist_area2' );" data-tooltip-text="Receba uma notificação por e-mail quando itens na sua lista de desejos forem lançados ou estiverem em promoção" aria-describedby="tooltip-3">
										<span>+ Lista de desejos</span>
									</a>
								</div>
```

### Botão para avançar

```html
<div id="nextInDiscoveryQueue" class="next_in_queue_area">

									<div data-panel="{&quot;noFocusRing&quot;:true,&quot;focusable&quot;:true,&quot;clickOnActivate&quot;:true}" role="button" class="btn_next_in_queue btn_next_in_queue_trigger" data-tooltip-text="Remover este produto da sua lista e seguir para o próximo item." aria-describedby="tooltip-7">
										<div class="next_in_queue_content">
																	<span>Próximo da lista<br>
									<span class="queue_sub_text">(2 restante(s))</span>
																</span>
															</div>
									</div>
								</div>
```

### Fim da fila

```html
<span class="btnv6_lightblue_blue btn_medium" id="refresh_queue_btn">
						<span>Iniciar outra lista&gt;&gt;</span>
						</span>
```

## Comportamento esperado

O fluxo deve rodar de forma recorrente, em background, sem intervenção manual, mantendo a navegação pela Discovery Queue e priorizando jogos que tenham cartas colecionáveis para adicionar à wishlist da Steam.