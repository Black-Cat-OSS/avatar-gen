module.exports = {
  preset: 'conventionalcommits',
  releaseCount: 0,
  skipUnstable: false,
  transform: (commit, context) => {
    // Преобразуем типы коммитов в русские названия
    if (commit.type === 'feat') {
      commit.type = 'Added';
    } else if (commit.type === 'fix') {
      commit.type = 'Fixed';
    } else if (commit.type === 'perf') {
      commit.type = 'Performance';
    } else if (commit.type === 'refactor') {
      commit.type = 'Changed';
    } else if (commit.type === 'docs') {
      commit.type = 'Documentation';
    } else if (commit.type === 'style') {
      commit.type = 'Style';
    } else if (commit.type === 'test') {
      commit.type = 'Testing';
    } else if (commit.type === 'build') {
      commit.type = 'Build';
    } else if (commit.type === 'ci') {
      commit.type = 'CI';
    } else if (commit.type === 'chore') {
      commit.type = 'Chore';
    } else if (commit.type === 'revert') {
      commit.type = 'Reverted';
    } else {
      return;
    }

    if (commit.scope === '*') {
      commit.scope = '';
    }

    if (typeof commit.hash === 'string') {
      commit.hash = commit.hash.substring(0, 7);
    }

    return commit;
  },
  groupBy: 'type',
  commitGroupsSort: 'title',
  commitsSort: ['scope', 'subject'],
  noteGroupsSort: 'title',
};
