#ifndef GAMEMAP_H
#define GAMEMAP_H

#include <QObject>

#include <vector>

enum TileType {
    Wall, FragileWall, Nothing
};

enum BonusType {
    IncreaseBombLimit,  DecreaseBombLimit,
    IncreaseSpeed,      DecreaseSpeed,
    PushBomb,           IncreaseBombRange,
    None
};

struct MapTile {
    quint16 id {0};
    quint16 x {0};
    quint16 y {0};
    TileType type = TileType::Nothing;
    BonusType bonus = BonusType::None;
};

class GameMap : public QObject
{
    Q_OBJECT
public:
    explicit GameMap(QObject *parent = nullptr);
    bool generate(quint32 sideN_);

signals:

public slots:

private:
    static std::vector<std::pair<quint16, quint16>> generateStartingAreaCoords(quint32 sideN_);
    bool isStartingArea(quint16 x, quint16 y, quint32 sideN);

    // tiles[y][x]
    std::vector<std::vector<MapTile>> tiles;
    bool m_generated = false;
};

#endif // GAMEMAP_H
