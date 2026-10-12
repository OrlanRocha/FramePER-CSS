/* Demo helpers: wires up [data-demo] buttons and the docs table of contents. */
document.addEventListener('DOMContentLoaded', function () {
  var F = window.FramePER;

  var actions = {
    'toast-success': function () { F.Notify.success('Salvo', 'Suas alterações foram salvas com sucesso.'); },
    'toast-error':   function () { F.Notify.error('Falha', 'Não foi possível concluir a operação.'); },
    'toast-info':    function () { F.Notify.info('Novidade', 'Uma nova versão está disponível.'); },
    'toast-warning': function () { F.Notify.show('Atenção', 'Sua assinatura expira em 3 dias.', 'warning'); },
    'page-loader':   function () { F.Loader.showPageLoad(); setTimeout(function () { F.Loader.hidePageLoad(); }, 1800); },
    'btn-loading':   function (el) { F.Loader.buttonLoading(el, true); setTimeout(function () { F.Loader.buttonLoading(el, false); }, 1800); },
    'http-ok': function (el) {
      F.Loader.buttonLoading(el, true);
      F.Http.get('https://jsonplaceholder.typicode.com/todos/1').then(function (res) {
        F.Loader.buttonLoading(el, false);
        if (res.ok) F.Notify.success('GET 200', 'Recebido: "' + F.Security.escapeHTML(res.data.title) + '"');
      });
    },
    'http-404': function (el) {
      F.Loader.buttonLoading(el, true);
      F.Http.get('https://jsonplaceholder.typicode.com/posts/99999').then(function () {
        F.Loader.buttonLoading(el, false);
      });
    }
  };

  document.querySelectorAll('[data-demo]').forEach(function (el) {
    el.addEventListener('click', function () {
      var fn = actions[el.getAttribute('data-demo')];
      if (fn) fn(el);
    });
  });

  // XSS escape playground
  var input = document.getElementById('escape-input');
  var output = document.getElementById('escape-output');
  if (input && output) {
    var render = function () { output.textContent = F.Security.escapeHTML(input.value); };
    input.addEventListener('input', render);
    render();
  }

  // Table of contents scroll-spy with auto sidebar tracking
  var links = Array.prototype.slice.call(document.querySelectorAll('.docs-nav a'));
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        map[href.slice(1)] = a;
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          var link = map[entry.target.id];
          if (link) {
            link.classList.add('active');
            var nav = link.closest('.docs-nav');
            if (nav) {
              var linkTop = link.offsetTop - nav.offsetTop;
              var linkBottom = linkTop + link.offsetHeight;
              if (linkTop < nav.scrollTop || linkBottom > (nav.scrollTop + nav.clientHeight)) {
                nav.scrollTo({
                  top: linkTop - (nav.clientHeight / 2) + (link.offsetHeight / 2),
                  behavior: 'smooth'
                });
              }
            }
          }
        }
      });
    }, { rootMargin: '-15% 0px -65% 0px' });

    document.querySelectorAll('.docs-section').forEach(function (s) { observer.observe(s); });
  }

  // Feedback para seleção em Menu de Contexto
  document.addEventListener('frameper:contextmenu:select', function (e) {
    if (F && F.Notify && e.detail && e.detail.action) {
      F.Notify.info('Menu de Contexto', 'Ação executada: "' + F.Security.escapeHTML(e.detail.action) + '"', 3000);
    }
  });

  // Handlers para Validador de Formulários
  var resetBtn = document.getElementById('btn-reset-demo-form');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      var form = document.getElementById('demo-register-form');
      if (form && form._frameValidator) {
        form._frameValidator.reset();
        form.reset();
        if (F && F.Notify) F.Notify.info('Formulário Limpo', 'Todos os campos e alertas foram reiniciados.', 2500);
      }
    });
  }

  document.addEventListener('frameper:form:success', function (e) {
    if (F && F.Notify) {
      F.Notify.success('Formulário Válido!', 'Todos os dados foram preenchidos corretamente e estão prontos para envio.', 4000);
    }
  });

  // Handlers para Central de Atividades
  var btnSimulate = document.getElementById('btn-simulate-activity');
  if (btnSimulate) {
    var simCount = 1;
    btnSimulate.addEventListener('click', function () {
      if (F && F.ActivityFeed) {
        var types = ['success', 'info', 'warning', 'system'];
        var type = types[Math.floor(Math.random() * types.length)];
        F.ActivityFeed.add({
          title: 'Notificação ao Vivo #' + (simCount++),
          desc: 'Evento gerado em tempo real na fila de atividades.',
          time: 'Agora mesmo',
          type: type,
          unread: true
        });
      }
    });
  }

  var btnMarkAll = document.getElementById('btn-demo-mark-all');
  if (btnMarkAll) {
    btnMarkAll.addEventListener('click', function () {
      if (F && F.ActivityFeed) {
        F.ActivityFeed.markAllAsRead();
        if (F.Notify) F.Notify.success('Notificações', 'Todas as notificações foram marcadas como lidas.', 2500);
      }
    });
  }

  // Handlers para SplitPane Demo (v2.15.0)
  var splitDemoEl = document.getElementById('demo-split-horizontal');
  var btnSplit30 = document.getElementById('btn-split-30');
  var btnSplit50 = document.getElementById('btn-split-50');
  var btnSplit70 = document.getElementById('btn-split-70');
  var btnSplitCollapse = document.getElementById('btn-split-toggle-collapse');

  if (splitDemoEl) {
    var getSplitInst = function () {
      return splitDemoEl._frameSplitPane || (F && F.SplitPane && F.SplitPane.get(splitDemoEl));
    };

    if (btnSplit30) {
      btnSplit30.addEventListener('click', function () {
        var inst = getSplitInst();
        if (inst) {
          inst.setSplit(30);
          if (F && F.Notify) F.Notify.info('Split View', 'Proporção alterada para 30% / 70%', 1500);
        }
      });
    }
    if (btnSplit50) {
      btnSplit50.addEventListener('click', function () {
        var inst = getSplitInst();
        if (inst) {
          inst.setSplit(50);
          if (F && F.Notify) F.Notify.info('Split View', 'Proporção equilibrada em 50% / 50%', 1500);
        }
      });
    }
    if (btnSplit70) {
      btnSplit70.addEventListener('click', function () {
        var inst = getSplitInst();
        if (inst) {
          inst.setSplit(70);
          if (F && F.Notify) F.Notify.info('Split View', 'Proporção alterada para 70% / 30%', 1500);
        }
      });
    }
    if (btnSplitCollapse) {
      btnSplitCollapse.addEventListener('click', function () {
        var inst = getSplitInst();
        if (inst) {
          inst.toggleCollapse();
          if (F && F.Notify) F.Notify.info('Split View', 'Colapso do painel alternado!', 1500);
        }
      });
    }
  }

  // Handlers para TreeView Demo (v2.16.0)
  var filesTreeEl = document.getElementById('demo-tree-files');
  var permsTreeEl = document.getElementById('demo-tree-permissions');
  var searchInput = document.getElementById('tree-search-input');
  var searchCount = document.getElementById('tree-search-count');
  var clearFilterBtn = document.getElementById('btn-tree-clear-filter');
  var expandAllBtn = document.getElementById('btn-tree-expand-all');
  var collapseAllBtn = document.getElementById('btn-tree-collapse-all');
  var selectedInfo = document.getElementById('tree-selected-info');

  var getFilesTree = function () {
    return filesTreeEl ? (filesTreeEl._frameTreeView || (F && F.TreeView && F.TreeView.get(filesTreeEl))) : null;
  };
  var getPermsTree = function () {
    return permsTreeEl ? (permsTreeEl._frameTreeView || (F && F.TreeView && F.TreeView.get(permsTreeEl))) : null;
  };

  if (filesTreeEl) {
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        var tree = getFilesTree();
        if (tree) {
          var val = searchInput.value.trim();
          var matches = tree.filter(val);
          if (searchCount) {
            searchCount.textContent = val ? (matches + ' encontrado(s)') : '';
          }
        }
      });
    }

    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', function () {
        var tree = getFilesTree();
        if (tree) {
          tree.clearFilter();
          if (searchInput) searchInput.value = '';
          if (searchCount) searchCount.textContent = '';
        }
      });
    }

    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', function () {
        var tree = getFilesTree();
        if (tree) tree.expandAll();
      });
    }

    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', function () {
        var tree = getFilesTree();
        if (tree) tree.collapseAll();
      });
    }

    filesTreeEl.addEventListener('frameper:tree:select', function (e) {
      if (selectedInfo && e.detail) {
        selectedInfo.textContent = e.detail.label || e.detail.id;
      }
    });
  }

  // Permissões Tree handlers
  if (permsTreeEl) {
    var checkAllBtn = document.getElementById('btn-tree-check-all');
    var uncheckAllBtn = document.getElementById('btn-tree-uncheck-all');
    var getCheckedBtn = document.getElementById('btn-tree-get-checked');
    var summaryEl = document.getElementById('tree-permissions-summary');

    var updatePermsSummary = function () {
      var tree = getPermsTree();
      if (tree && summaryEl) {
        var checked = tree.getChecked().filter(function (item) { return item.checked; });
        summaryEl.textContent = checked.length + ' ativa(s)';
      }
    };

    setTimeout(updatePermsSummary, 100);

    permsTreeEl.addEventListener('frameper:tree:check', function () {
      updatePermsSummary();
    });

    if (checkAllBtn) {
      checkAllBtn.addEventListener('click', function () {
        var tree = getPermsTree();
        if (tree) {
          tree.container.querySelectorAll(':scope > .tree-root > .tree-node, :scope > .tree-node').forEach(function (n) {
            tree.check(n, true);
          });
          updatePermsSummary();
        }
      });
    }

    if (uncheckAllBtn) {
      uncheckAllBtn.addEventListener('click', function () {
        var tree = getPermsTree();
        if (tree) {
          tree.container.querySelectorAll(':scope > .tree-root > .tree-node, :scope > .tree-node').forEach(function (n) {
            tree.check(n, false);
          });
          updatePermsSummary();
        }
      });
    }

    if (getCheckedBtn) {
      getCheckedBtn.addEventListener('click', function () {
        var tree = getPermsTree();
        if (tree) {
          var checkedItems = tree.getChecked().filter(function (item) { return item.checked; });
          var labels = checkedItems.map(function (item) { return item.label; }).slice(0, 3).join(', ');
          var more = checkedItems.length > 3 ? ' (+' + (checkedItems.length - 3) + ' mais)' : '';
          if (F && F.Notify) {
            F.Notify.info('Permissões Ativas (' + checkedItems.length + ')', labels ? (labels + more) : 'Nenhuma permissão selecionada.');
          }
        }
      });
    }
  }

  // Handlers para DataGrid Demo (v2.17.0)
  var gridDemoEl = document.getElementById('demo-datagrid');
  var btnGridSelectAll = document.getElementById('btn-grid-select-all');
  var btnGridDeselectAll = document.getElementById('btn-grid-deselect-all');
  var btnGridGetSelected = document.getElementById('btn-grid-get-selected');

  var getGridInst = function () {
    return gridDemoEl ? (gridDemoEl._frameDataGrid || (F && F.DataGrid && F.DataGrid.get(gridDemoEl))) : null;
  };

  if (gridDemoEl) {
    if (btnGridSelectAll) {
      btnGridSelectAll.addEventListener('click', function () {
        var grid = getGridInst();
        if (grid) grid.selectAll();
      });
    }

    if (btnGridDeselectAll) {
      btnGridDeselectAll.addEventListener('click', function () {
        var grid = getGridInst();
        if (grid) grid.deselectAll();
      });
    }

    if (btnGridGetSelected) {
      btnGridGetSelected.addEventListener('click', function () {
        var grid = getGridInst();
        if (grid) {
          var selected = grid.getSelected();
          if (selected.length === 0) {
            if (F && F.Notify) F.Notify.show('Data Grid', 'Nenhuma linha selecionada na tabela.', 'warning');
          } else {
            var customers = selected.map(function (r) {
              return (r._customer_raw || r.customer || r._gridId);
            }).slice(0, 3).join(', ');
            var extra = selected.length > 3 ? ' (+' + (selected.length - 3) + ' mais)' : '';
            if (F && F.Notify) {
              F.Notify.success('Linhas Selecionadas (' + selected.length + ')', customers + extra);
            }
          }
        }
      });
    }
  }

  // Handlers para Kanban Demo (v2.18.0)
  var kanbanBoardEl = document.getElementById('demo-kanban-board');
  var btnKanbanAdd = document.getElementById('btn-kanban-add-demo');
  var btnKanbanReset = document.getElementById('btn-kanban-reset');

  var getKanbanInst = function () {
    return kanbanBoardEl ? (kanbanBoardEl._frameKanban || (F && F.Kanban && F.Kanban.get(kanbanBoardEl))) : null;
  };

  if (kanbanBoardEl) {
    var taskCount = 8;

    if (btnKanbanAdd) {
      btnKanbanAdd.addEventListener('click', function () {
        var kanban = getKanbanInst();
        if (kanban) {
          var card = kanban.addCard('col-todo', {
            id: 'card-' + (taskCount++),
            title: 'Nova Tarefa Criada #' + (taskCount - 1),
            desc: 'Tarefa gerada dinamicamente via API FramePER.Kanban.addCard().',
            tags: [{ label: 'Nova', className: 'badge-purple badge-xs' }],
            date: 'Agora',
            assignee: 'Você'
          });
          if (card && F && F.Notify) {
            F.Notify.success('Kanban', 'Nova tarefa adicionada à coluna "A Fazer"!');
          }
        }
      });
    }

    if (btnKanbanReset) {
      btnKanbanReset.addEventListener('click', function () {
        try {
          localStorage.removeItem('demo-kanban-state');
        } catch (e) {}
        if (F && F.Notify) {
          F.Notify.info('Kanban', 'Estado salvo limpo. Recarregue a página para restaurar a ordem inicial.');
        }
      });
    }

    kanbanBoardEl.addEventListener('frameper:kanban:move', function (e) {
      if (F && F.Notify && e.detail) {
        var toCol = e.detail.toColumnId;
        var colName = toCol === 'col-todo' ? 'A Fazer' : (toCol === 'col-progress' ? 'Em Andamento' : 'Concluído');
        F.Notify.info('Tarefa Movida', 'Cartão movido para "' + colName + '" (posição ' + (e.detail.newIndex + 1) + ')', 2000);
      }
    });
  }

  // Handlers para Timeline Demo (v2.19.0)
  var orderTimelineEl = document.getElementById('demo-order-timeline');
  var auditTimelineEl = document.getElementById('demo-audit-timeline');
  var btnTimelineAdvance = document.getElementById('btn-timeline-advance');
  var btnTimelineAdd = document.getElementById('btn-timeline-add-demo');
  var timelineBadge = document.getElementById('timeline-status-badge');

  var getOrderTimeline = function () {
    return orderTimelineEl ? (orderTimelineEl._frameTimeline || (F && F.Timeline && F.Timeline.get(orderTimelineEl))) : null;
  };

  var getAuditTimeline = function () {
    return auditTimelineEl ? (auditTimelineEl._frameTimeline || (F && F.Timeline && F.Timeline.get(auditTimelineEl))) : null;
  };

  if (btnTimelineAdvance) {
    var stepAdvanced = false;
    btnTimelineAdvance.addEventListener('click', function () {
      var timeline = getOrderTimeline();
      if (!timeline) return;

      if (!stepAdvanced) {
        // Conclui a etapa 3 e ativa a etapa 4
        timeline.setStatus('step-3', 'completed', 'success');
        timeline.setStatus('step-4', 'completed', 'success');

        var step4 = orderTimelineEl.querySelector('[data-item-id="step-4"]');
        if (step4) {
          var point = step4.querySelector('.timeline-point');
          if (point) {
            point.classList.remove('point-dot');
            point.classList.add('point-success');
            point.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:0.9rem;height:0.9rem"><polyline points="20 6 9 17 4 12"/></svg>';
          }
          var timeSpan = step4.querySelector('.timeline-time');
          if (timeSpan) timeSpan.textContent = 'Hoje às 14:45';
        }

        if (timelineBadge) {
          timelineBadge.className = 'badge badge-green badge-sm';
          timelineBadge.textContent = 'Entregue com Sucesso';
        }

        stepAdvanced = true;
        btnTimelineAdvance.innerHTML = '<i class="icon icon-rotate-ccw"></i> Resetar Rastreio';

        if (F && F.Notify) {
          F.Notify.success('Rastreio Concluído', 'O pedido #48291 foi marcado como entregue!');
        }
      } else {
        // Reset demo
        timeline.setStatus('step-3', 'active', 'primary');
        var step3Point = orderTimelineEl.querySelector('[data-item-id="step-3"] .timeline-point');
        if (step3Point) step3Point.classList.add('has-pulse');

        timeline.setStatus('step-4', 'pending', null);
        var step4 = orderTimelineEl.querySelector('[data-item-id="step-4"]');
        if (step4) {
          var point = step4.querySelector('.timeline-point');
          if (point) {
            point.className = 'timeline-point point-dot';
            point.innerHTML = '';
          }
          var timeSpan = step4.querySelector('.timeline-time');
          if (timeSpan) timeSpan.textContent = 'Aguardando';
        }

        if (timelineBadge) {
          timelineBadge.className = 'badge badge-success badge-sm';
          timelineBadge.textContent = 'Em Trânsito';
        }

        stepAdvanced = false;
        btnTimelineAdvance.innerHTML = '<i class="icon icon-check"></i> Avançar Etapa';

        if (F && F.Notify) {
          F.Notify.info('Rastreio', 'Estado do rastreio reiniciado para demonstração.');
        }
      }
    });
  }

  if (btnTimelineAdd) {
    var auditCount = 1;
    btnTimelineAdd.addEventListener('click', function () {
      var audit = getAuditTimeline();
      if (audit) {
        var actions = [
          { title: 'Chave de API Revogada', body: 'Token com escopo administrativo foi revogado por segurança.', color: 'danger', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' },
          { title: 'Certificado SSL Renovado', body: 'Certificado Let\'s Encrypt Wildcard atualizado com sucesso.', color: 'primary', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
          { title: 'Novo Membro na Equipe', body: 'Usuário beatriz.design@frameper.dev ingressou no Workspace.', color: 'purple', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' }
        ];
        var action = actions[(auditCount - 1) % actions.length];
        auditCount++;

        audit.addItem({
          title: action.title,
          desc: action.body,
          time: 'Agora mesmo',
          color: action.color,
          icon: action.icon
        }, true);

        if (F && F.Notify) {
          F.Notify.success('Novo Log Registrado', action.title + ' adicionado ao início da timeline!');
        }
      }
    });
  }

  // Handlers para Tour Guiado (v2.20.0)
  var btnStartInteractiveTour = document.getElementById('btn-start-interactive-tour');
  var btnStartSpotlightStep = document.getElementById('btn-start-spotlight-step');

  if (btnStartInteractiveTour) {
    btnStartInteractiveTour.addEventListener('click', function () {
      if (F && F.Tour) {
        F.Tour.start({
          steps: [
            {
              target: '#tour-card-spotlight-1',
              title: 'Spotlight com Anel Pulsante',
              content: 'O foco focal recorta o elemento exato na tela, permitindo guiar novos usuários com clareza.',
              placement: 'top'
            },
            {
              target: '#tour-card-spotlight-2',
              title: 'Controles Completos por Teclado',
              content: 'Pressione as setas do teclado (ou Enter) para navegar entre os passos sem tocar no mouse.',
              placement: 'top'
            },
            {
              target: '#tour-card-spotlight-3',
              title: 'Compatibilidade & Dark Mode',
              content: 'Funciona nativamente em temas claros e escuros sem nenhuma biblioteca externa!',
              placement: 'top'
            }
          ]
        });
      }
    });
  }

  if (btnStartSpotlightStep) {
    btnStartSpotlightStep.addEventListener('click', function () {
      if (F && F.Tour) {
        F.Tour.start({
          steps: [
            {
              target: '#split-pane-demo',
              title: 'Split View & Painéis Redimensionáveis',
              content: 'Arraste a calha para redimensionar em tempo real ou use as setas do teclado.',
              placement: 'top'
            }
          ]
        });
      }
    });
  }

  // Quick live search filter for icons in components.html
  var compIconSearch = document.getElementById('comp-icons-search');
  var compIconCount = document.getElementById('comp-icons-count');
  var secIcons = document.getElementById('sec-icons');
  if (compIconSearch && secIcons) {
    var compTiles = Array.prototype.slice.call(secIcons.querySelectorAll('.icon-tile'));
    compIconSearch.addEventListener('input', function () {
      var q = compIconSearch.value.trim().toLowerCase();
      var visible = 0;
      compTiles.forEach(function (tile) {
        var copy = (tile.getAttribute('data-copy') || '').toLowerCase();
        var tooltip = (tile.getAttribute('data-tooltip') || '').toLowerCase();
        var text = tile.textContent.trim().toLowerCase();
        if (!q || copy.indexOf(q) !== -1 || tooltip.indexOf(q) !== -1 || text.indexOf(q) !== -1) {
          tile.style.display = '';
          visible++;
        } else {
          tile.style.display = 'none';
        }
      });
      if (compIconCount) {
        compIconCount.textContent = q ? visible + ' de ' + compTiles.length + ' encontrados' : 'Exibindo todos os ' + compTiles.length + ' ícones';
      }
    });
  }
});




