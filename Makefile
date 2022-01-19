SRC_FILES = needls/ docs/conf.py

.PHONY: list
list:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'

.PHONY: lint
lint:
	pre-commit run --all-files

.PHONY: test
test:
	pytest needls/tests


.PHONY: docs-html
docs-html:
	sphinx-build -a -E -j auto -b html docs/ docs/_build

.PHONY: docs-pdf
docs-pdf:
	make --directory docs/ clean && make --directory docs/ latexpdf


.PHONY: docs-linkcheck
docs-linkcheck:
	make --directory docs/ linkcheck

.PHONY: format
format:
	black ${SRC_FILES}
