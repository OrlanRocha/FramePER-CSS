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

  // Table of contents scroll-spy
  var links = Array.prototype.slice.call(document.querySelectorAll('.docs-nav a'));
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          var link = map[entry.target.id];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

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
        if (inst) inst.setSplit(30);
      });
    }
    if (btnSplit50) {
      btnSplit50.addEventListener('click', function () {
        var inst = getSplitInst();
        if (inst) inst.setSplit(50);
      });
    }
    if (btnSplit70) {
      btnSplit70.addEventListener('click', function () {
        var inst = getSplitInst();
        if (inst) inst.setSplit(70);
      });
    }
    if (btnSplitCollapse) {
      btnSplitCollapse.addEventListener('click', function () {
        var inst = getSplitInst();
        if (inst) inst.toggleCollapse();
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
});

